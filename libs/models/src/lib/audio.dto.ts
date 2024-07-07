export class CreateFileDto {
  readonly filePath: string;
  readonly endTime?: string;
  readonly startTime?: string;
  readonly startSecond?: number;
  readonly output: string;
  readonly duration: number;
  readonly id: string;
}
