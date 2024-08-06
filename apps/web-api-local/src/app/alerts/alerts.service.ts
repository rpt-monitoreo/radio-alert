// alerta.service.ts
import { Injectable } from '@nestjs/common';
import {
  DataSource,
  FindOneOptions,
  FindOptionsWhere,
  MongoRepository,
} from 'typeorm';
import {
  GetAlertsDto,
  GetSummaryDto,
  GetTranscriptionDto,
  SummaryDto,
  TranscriptionDto,
  ValidDatesDto,
} from '@repo/shared';
import OpenAI from 'openai';
import { exec } from 'child_process';
import path from 'path';
import { ConfigService } from '@nestjs/config';
import { Alert, Note, Transcription } from '../entities';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class AlertsService {
  alertsRepo: MongoRepository<Alert>;
  transcriptRepo: MongoRepository<Transcription>;
  noteRepo: MongoRepository<Note>;
  openai: OpenAI;

  constructor(
    @InjectDataSource('monitoring') private readonly dataSource: DataSource,
    configService: ConfigService,
  ) {
    this.alertsRepo = this.dataSource.getMongoRepository(Alert);
    this.transcriptRepo = this.dataSource.getMongoRepository(Transcription);
    this.noteRepo = this.dataSource.getMongoRepository(Note);
    this.openai = new OpenAI({
      apiKey: configService.get<string>('OPEN_AI_KEY'),
    });
  }

  async getChatResponse(getSummaryDto: GetSummaryDto): Promise<SummaryDto> {
    try {
      const prompt = `Genera un título separado por una línea nueva y un resumen en forma de noticia escrita en tercera persona. 
      Asegúrate de que el resumen sea fiel a los hechos y no atribuya incorrectamente acciones o eventos a personas o entidades mencionadas en el texto. 
      Aquí está el texto a resumir: ${getSummaryDto.text}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
      });
      if (!response.choices[0].message.content)
        throw new Error('No content in response');

      const message = response.choices[0].message?.content
        .replace(/#/g, '')
        .replace(/\*/g, '');
      const title = message.split('\n')[0].trim();
      const summary = message.split('\n').slice(1).join('\n').trim();

      // Truncate summary after the last period
      /* const lastPeriodIndex = summary.lastIndexOf('.');
      if (lastPeriodIndex !== -1) {
        summary = summary.substring(0, lastPeriodIndex + 1);
      } */

      await this.noteRepo.update(
        { id: getSummaryDto.noteId },
        { title, summary },
      );

      return { title, summary };
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
    const {
      startDate = '',
      endDate = '',
      clientName = '',
      type = [],
    } = getAlertasDto;

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

  async getText(
    getTranscriptionDto: GetTranscriptionDto,
  ): Promise<TranscriptionDto> {
    if (!getTranscriptionDto.filename) throw new Error('Filename is required');
    const scriptPath = './scripts/getTranscription.py';
    const filePath = path.resolve(
      `./audioFiles/${getTranscriptionDto.filename}`,
    );

    await this.runPythonScript(scriptPath, [filePath]);

    const alertId = getTranscriptionDto.filename
      .split('_')[1]
      .replace('.wav', '');
    const note = await this.noteRepo.findOne({ where: { alert_id: alertId } });
    if (!note) throw new Error('Note not found');
    return { noteId: note.id, text: note.text };
  }

  async getValidDates(
    getAlertsDto: Partial<GetAlertsDto>,
  ): Promise<ValidDatesDto> {
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
    if (min === null || max === null) throw new Error('No alerts found');
    return {
      minDate: this.getDate(min.endTime),
      maxDate: this.getDate(max.endTime),
    };
  }

  getDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
