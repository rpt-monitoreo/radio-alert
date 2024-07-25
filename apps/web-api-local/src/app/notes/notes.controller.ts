import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NoteDto } from '@radio-alert/models';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post('set-note')
  async setNote(@Body() noteDto: NoteDto) {
    try {
      return await this.notesService.setNote(noteDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `There was an error processing the request setNote ${error}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
