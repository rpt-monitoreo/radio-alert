// alerta.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource, FindOneOptions, FindOptionsWhere, MongoRepository } from 'typeorm';
import { Alert } from './alerts.entity';
import { GetAlertsDto, GetTranscriptionDto, ValidDatesDto } from '@radio-alert/models';
import { Transcription } from './transcription.entity';
import OpenAI from 'openai';
import { exec } from 'child_process';
import path from 'path';
import { promises as fs } from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AlertsService {
  alertsRepo: MongoRepository<Alert>;
  transcriptRepo: MongoRepository<Transcription>;
  openai: OpenAI;

  constructor(private dataSource: DataSource, configService: ConfigService) {
    this.alertsRepo = this.dataSource.getMongoRepository(Alert);
    this.transcriptRepo = this.dataSource.getMongoRepository(Transcription);
    this.openai = new OpenAI({
      apiKey: configService.get<string>('OPEN_AI_KEY'),
    });
  }

  async getChatResponse(prompt: string): Promise<string> {
    try {
      //const message = prompt;
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
      });

      const message = response.choices[0].message?.content;
      return message || 'No response from the model.';
    } catch (error) {
      throw new Error(`Error fetching response from OpenAI.${error}`);
    }
  }

  async runPythonScript(scriptPath: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const command = `python ${scriptPath} ${args.join(' ')}`;
      exec(command, { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Error: ${error.message}`));
          return;
        }
        if (stderr) {
          reject(new Error(`Stderr: ${stderr}`));
          return;
        }
        resolve(stdout);
      });
    });
  }

  async getAlerts(getAlertasDto: GetAlertsDto) {
    if (!getAlertasDto) {
      throw new Error('getAlertasDto is undefined');
    }
    const { startDate = '', endDate = '', clientName = '', type = [] } = getAlertasDto;

    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required');
    }

    const findOptions: FindOneOptions<Alert> = {
      where: {
        endTime: {
          $gte: new Date(startDate + 'T00:00:00.000Z'),
          $lte: new Date(endDate + 'T23:59:59.999Z'),
        },
        ...(clientName && { clientName }),
        ...(type.length > 0 && { type: { $in: type } }),
      } as unknown as FindOptionsWhere<Alert>,
    };
    return this.alertsRepo.find(findOptions);
  }

  async readAndDeleteFile(textPath: string): Promise<string> {
    try {
      // Leer el contenido del archivo
      const content = await fs.readFile(textPath, 'utf-8');
      // Eliminar el archivo
      await fs.unlink(textPath);
      // Retornar el contenido del archivo
      return content;
    } catch (error) {
      throw new Error(`Error reading or deleting file: ${error}`);
    }
  }

  async getText(getTranscriptionDto: GetTranscriptionDto): Promise<string> {
    const scriptPath = './scripts/getTranscription.py';
    const filePath = path.resolve(`./audioFiles/${getTranscriptionDto.filename}`);

    await this.runPythonScript(scriptPath, [filePath]);

    const textPath = path.resolve(`${filePath.replace('.wav', '_transcription.txt')}`);
    const text = await this.readAndDeleteFile(textPath);

    const promt = `Generar titulo y resumen como noticia en tercera persona con estas palabras clave: (${getTranscriptionDto.words.join(
      ', '
    )}) de el siguiente texto: ${text}`;

    return promt;
    //return await this.getChatResponse(promt);
  }

  async getValidDates(getAlertsDto: Partial<GetAlertsDto>): Promise<ValidDatesDto> {
    const getAlerts = getAlertsDto || {};
    const { clientName } = getAlerts;
    const query: FindOneOptions<Alert> = {
      where: { ...(clientName && { clientName }) },
    };
    // Get the first document by ascending order of date
    const min = await this.alertsRepo.findOne({
      ...query,
      order: { endTime: 'ASC' },
    });

    // Get the last document by descending order of date
    const max = await this.alertsRepo.findOne({
      ...query,
      order: { endTime: 'DESC' },
    });

    return {
      minDate: this.getDate(min.endTime),
      maxDate: this.getDate(max.endTime),
    };
  }

  getDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
