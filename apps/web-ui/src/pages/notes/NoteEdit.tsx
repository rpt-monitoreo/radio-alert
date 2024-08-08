import { NoteDto } from "@repo/shared";
import { Button, Col, message, Row, Spin } from "antd";
import api from "../../services/Agent";
import { useMutation, UseMutationResult } from "react-query";
import { useEffect } from "react";

interface AudioEditProps {
  note: NoteDto;
}
const AudioEdit: React.FC<AudioEditProps> = ({ note }) => {
  const {
    mutateAsync: sendNoteMutation,
    data: wasSendNote,
    isLoading: isSendingNote,
    error: errorSendingNote,
  }: UseMutationResult<NoteDto, unknown, NoteDto, unknown> = useMutation<
    NoteDto,
    unknown,
    NoteDto,
    unknown
  >(async () => {
    const response = await api.post(`/notes/send-note`, note);
    return response.data;
  });

  useEffect(() => {
    if (errorSendingNote) {
      message.error(`Error sending note`);
    }
  }, [errorSendingNote]);

  return (
    <Col>
      <Row>{note.message}</Row>
      <Spin spinning={isSendingNote}>
        <Button
          type="primary"
          size="small"
          onClick={async () => sendNoteMutation(note)}
        >
          Enviar
        </Button>
      </Spin>
      <Row>{wasSendNote ? "Nota Enviada" : ""}</Row>
    </Col>
  );
};

export default AudioEdit;
