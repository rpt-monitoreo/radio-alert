import { Injectable } from '@nestjs/common';
import { DataSource, MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { NoteDto } from '@repo/shared';
import { Note } from '../entities';
import { InjectDataSource } from '@nestjs/typeorm';
import * as moment from 'moment';
import * as path from 'path';
import * as spawn from 'cross-spawn';

@Injectable()
export class NotesService {
  noteRepo: MongoRepository<Note>;

  constructor(
    @InjectDataSource('monitoring') private readonly dataSource: DataSource,
  ) {
    this.noteRepo = this.dataSource.getMongoRepository(Note);
  }

  async setNote(noteDto: NoteDto): Promise<NoteDto> {
    const existingNote = await this.noteRepo.findOneBy({
      _id: new ObjectId(noteDto.id),
    });

    if (!existingNote) {
      throw new Error('Note not found');
    }
    noteDto.message = this.generateMessage(noteDto);
    Object.assign(existingNote, noteDto);
    // Save the updated note
    return await this.noteRepo.save(existingNote);
  }

  generateMessage(note: NoteDto): string {
    function formatDuration(seconds: number): string {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      let formattedDuration = '';

      if (hours > 0) {
        formattedDuration += `${hours}h `;
      }

      if (minutes > 0) {
        formattedDuration += `${minutes}’`;
      }

      formattedDuration += `${remainingSeconds}”`;

      return `(${formattedDuration.trim()})`;
    }

    function formatPlainText(text: string): string {
      return text.replace(/[\n\r\t]/g, ' ').trim();
    }

    return `NOTA ${note.index} ${note.program} **${note.title}** ${formatPlainText(note.summary)} ${formatDuration(note.duration)} (${moment(note.startTime).format('h:mm A')})`;
  }

  async sendMessage(noteDto: NoteDto): Promise<boolean> {
    const wasMessageSend = await this.sendWhatsAppMessage(
      noteDto.message,
      '573154421610',
    );

    const audioFilePath = path.resolve(
      `./audioFiles/fragment_${noteDto.alert_id}.mp3`,
    );
    console.log(`Sending audio file: ${audioFilePath}`);

    const wasAudioSend = await this.sendWhatsAppMessage(
      audioFilePath,
      '573154421610',
      true,
    );

    if (!wasMessageSend) {
      throw new Error('Error sending message');
    }
    if (!wasAudioSend) {
      throw new Error('Error sending audio');
    }

    return true;
  }

  async sendWhatsAppMessage(
    content: string,
    phoneNumber: string,
    isAudio: boolean = false,
  ): Promise<boolean> {
    let wasSend = false;
    try {
      const npxPath = 'C:\\Program Files\\nodejs\\npx.cmd'; // Adjust this path as needed

      const args = isAudio
        ? ['mudslide', 'send-file', phoneNumber, content, '--type', 'audio']
        : ['mudslide', 'send', phoneNumber, content];

      const result = spawn.sync(npxPath, args, {
        encoding: 'utf-8',
      });

      if (result.error || result.stderr || result.status !== 0) {
        throw new Error(
          `Error sending WhatsApp ${isAudio ? 'audio' : 'message'}: ${result.stderr}`,
        );
      } else {
        wasSend = true;
      }
    } catch (e) {
      throw new Error(`Exception occurred: ${(e as Error).message}`);
    }
    return wasSend;
  }
}
