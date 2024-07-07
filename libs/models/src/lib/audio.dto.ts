export class CreateFileDto {
  readonly filePath: string;
  readonly endTime?: string;
  readonly startSecond?: number;
  readonly output: string;
  readonly duration: number;
  readonly id: string;
}
