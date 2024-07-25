import { Injectable } from '@nestjs/common';
import { DataSource, MongoRepository } from 'typeorm';
import { ObjectId, MongoClient } from 'mongodb';
import { NoteDto } from '@radio-alert/models';
import { Note } from '../entities';
import { InjectDataSource } from '@nestjs/typeorm';
import * as spawn from 'cross-spawn';
import Grid from 'gridfs-stream';
import { promises as fs } from 'fs';

@Injectable()
export class NotesService {
  noteRepo: MongoRepository<Note>;

  constructor(@InjectDataSource('monitoring') private readonly dataSource: DataSource) {
    this.noteRepo = this.dataSource.getMongoRepository(Note);
  }

  async setNote(noteDto: NoteDto): Promise<NoteDto> {
    const existingNote = await this.noteRepo.findOneBy({ _id: new ObjectId(noteDto.id) });

    if (!existingNote) {
      throw new Error('Platform not found');
    }

    Object.assign(existingNote, noteDto);

    // Save the updated note
    const updatedNote = await this.noteRepo.save(existingNote);
    /*  const wasSend = this.sendWhatsAppMessage('hola', '+573003101083');
    console.log('Message sent: ', wasSend);
    const audioFile = await this.getAudioFile(updatedNote.id);

    if (audioFile) {
      // Specify the path and filename where you want to save the audio file
      const filePath = `./savedAudioFiles/${updatedNote.id}.mp3`; // Example path and filename

      try {
        await fs.writeFile(filePath, audioFile);
        console.log(`Audio file saved successfully at ${filePath}`);
      } catch (error) {
        console.error('Failed to save the audio file:', error);
      }
    } */
    return updatedNote;
  }

  async sendWhatsAppMessage(message: string, phoneNumber: string): Promise<boolean> {
    let wasSend = false;
    try {
      const npxPath = 'C:\\Program Files\\nodejs\\npx.cmd'; // Adjust this path as needed

      const result = spawn.sync(npxPath, ['mudslide', 'send', phoneNumber, message], {
        encoding: 'utf-8',
      });

      if (result.error) {
        throw new Error(`Error sending WhatsApp message: ${result.stderr}`);
      } else {
        wasSend = true;
      }
    } catch (e) {
      throw new Error(`Exception occurred: ${e.message}`);
    }
    return wasSend;
  }

  /*  async getAudioFile(noteId: string): Promise<Buffer | null> {
    try {
      const uri = 'mongodb://localhost:27017/';
      const dbName = 'monitoring';
      const client = new MongoClient(uri);

      await client.connect();
      const db = client.db(dbName);

      // Initialize GridFS
      const gfs = Grid(db, MongoClient);
      gfs.collection('fs');

      // Find the file information from fs.files collection
      const file = await gfs.files.findOne({ 'metadata.note_id': noteId });
      if (!file) {
        console.log('No file found');
        return null;
      }

      // Retrieve the file content from fs.chunks
      const readstream = gfs.createReadStream({
        _id: file._id,
      });

      const chunks = [];
      for await (const chunk of readstream) {
        chunks.push(chunk);
      }

      // Combine the chunks into a single buffer
      const fileBuffer = Buffer.concat(chunks);

      await client.close();

      return fileBuffer;
    } catch (error) {
      console.error('Failed to retrieve file:', error);
      return null;
    }
  } */
}
