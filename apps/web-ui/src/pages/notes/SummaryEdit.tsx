import { useMemo, useRef } from 'react';
import { Button, Col, Input, Row, Spin } from 'antd';
import { GetSummaryDto, GetTranscriptionDto, SummaryDto, TranscriptionDto } from '@radio-alert/models';
import TextArea from 'antd/es/input/TextArea';
import { useAlert } from '../alerts/AlertsContext';
import { useMutation, UseMutationResult } from 'react-query';
import axios from 'axios';
import Title from 'antd/es/typography/Title';

type TranscriptionMutationResult = UseMutationResult<TranscriptionDto, unknown, GetTranscriptionDto, unknown>;
type SummaryMutationResult = UseMutationResult<SummaryDto, unknown, GetSummaryDto, unknown>;

const SummaryEdit: React.FC = () => {
  const { selectedAlert } = useAlert();
  const getSummaryDtoRef = useRef(new GetSummaryDto()); // Replace initialGetSummaryDtoValue with the initial value

  const waveformUrl = useMemo(
    () => `${import.meta.env.VITE_API_LOCAL}audio/fetchByName/fragment_${selectedAlert?.id}?v=${Date.now()}`,
    [selectedAlert]
  );

  const getTranscriptionDto: GetTranscriptionDto = useMemo(
    () =>
      selectedAlert
        ? {
            filename: `fragment_${selectedAlert.id}.wav`,
          }
        : new GetTranscriptionDto(),
    [selectedAlert]
  );

  const {
    mutateAsync: generateTranscription,
    data: transcriptionData,
    isLoading: isLoadingTranscription,
    error: errorTranscription,
  }: TranscriptionMutationResult = useMutation<TranscriptionDto, unknown, GetTranscriptionDto, unknown>(
    async () => {
      const response = await axios.post(`${import.meta.env.VITE_API_LOCAL}alerts/getText`, getTranscriptionDto);
      return response.data;
    },
    {
      onSuccess: transcriptionData => {
        // Trigger the second mutation when the first one is successful
        if (!selectedAlert || !transcriptionData) return;
        getSummaryDtoRef.current = {
          noteId: transcriptionData?.noteId,
          text: transcriptionData?.text,
          words: selectedAlert.words,
        };
        //generateSummary(getSummaryDtoRef.current);
      },
    }
  );

  // Second mutation
  const {
    mutateAsync: generateSummary,
    data: summaryData,
    isLoading: isLoadingSummary,
    error: errorSummary,
  }: SummaryMutationResult = useMutation<SummaryDto, unknown, GetSummaryDto, unknown>(async () => {
    const response = await axios.post(`${import.meta.env.VITE_API_LOCAL}alerts/getSummary`, getSummaryDtoRef.current);
    return response.data;
  });

  return waveformUrl ? (
    <>
      <Row align='middle'>
        <audio src={waveformUrl} controls>
          <track kind='captions' src='captions.vtt' label='Captions' />
          Tu navegador no soporta el elemento de audio.
        </audio>

        <Button type='primary' onClick={() => generateTranscription(getTranscriptionDto)} size='small' disabled={!!isLoadingTranscription}>
          Texto
        </Button>
      </Row>
      <Row align='middle'>
        <Col span={11}>
          {errorTranscription ? (
            <div>Error cargando la transcripción</div>
          ) : (
            <Spin spinning={isLoadingTranscription}>
              <Title level={4}>Transcripción</Title>
              <TextArea
                value={transcriptionData?.text}
                placeholder='Transcripción...'
                autoSize={{ minRows: 8, maxRows: 20 }}
                style={{ height: '100%' }}
              />
            </Spin>
          )}
        </Col>
        <Col span={2}></Col>
        <Col span={11}>
          {errorSummary ? (
            <div>Error cargando el resumen</div>
          ) : (
            <Spin spinning={isLoadingSummary || isLoadingTranscription}>
              <Title level={4}>Título</Title>
              <Input value={summaryData?.title} placeholder='Título...' />
              <Title level={4}>Resumen</Title>
              <TextArea value={summaryData?.summary} placeholder='Resumen...' autoSize={{ minRows: 6, maxRows: 20 }} style={{ height: '100%' }} />
            </Spin>
          )}
        </Col>
        {/*   <Col span={12}>{summary && <TextArea value={summary} placeholder='Escribe aquí...' rows={4} />}</Col> */}
      </Row>
    </>
  ) : null;
};

export default SummaryEdit;
