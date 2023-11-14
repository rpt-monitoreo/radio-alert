export class AlertaDto {
  readonly date: Date;
  readonly texto: string;
  readonly palabra: string;
  readonly emisora: string;
  readonly tiempo: string;
  readonly cliente: string;
}

export class GetAlertasDto {
  readonly fechaInicio: string;
  readonly fechaFinal: string;
  readonly palabra?: string;
}
