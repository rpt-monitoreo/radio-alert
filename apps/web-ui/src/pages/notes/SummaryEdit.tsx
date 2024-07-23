import { useEffect, useMemo, useRef } from 'react';
import { Button, Col, Form, FormInstance, FormProps, Input, Row, Spin } from 'antd';
import { GetSummaryDto, GetTranscriptionDto, SummaryDto, TranscriptionDto, transformText } from '@radio-alert/models';
import TextArea from 'antd/es/input/TextArea';
import { useAlert } from '../alerts/AlertsContext';
import { useMutation, UseMutationResult } from 'react-query';
import axios from 'axios';
import Title from 'antd/es/typography/Title';
import { useNote } from './NoteContext';

type TranscriptionMutationResult = UseMutationResult<TranscriptionDto, unknown, GetTranscriptionDto, unknown>;
type SummaryMutationResult = UseMutationResult<SummaryDto, unknown, GetSummaryDto, unknown>;

type FieldType = {
  index?: string;
  program?: string;
  title?: string;
  summary?: string;
};

interface SummaryEditProps {
  form: FormInstance<FieldType>;
}
const SummaryEdit: React.FC<SummaryEditProps> = ({ form }) => {
  const { selectedAlert } = useAlert();
  const { note, setNote } = useNote();
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
        generateSummary(getSummaryDtoRef.current);
      },
    }
  );

  // Second mutation
  const {
    mutateAsync: generateSummary,
    data: summaryData,
    isLoading: isLoadingSummary,
    error: errorSummary,
  }: SummaryMutationResult = useMutation<SummaryDto, unknown, GetSummaryDto, unknown>(
    async () => {
      const response = await axios.post(`${import.meta.env.VITE_API_LOCAL}alerts/getSummary`, getSummaryDtoRef.current);
      return response.data;
    },
    {
      onSuccess: summaryData => {
        if (!summaryData) return;
        setNote({
          ...note,
          id: getSummaryDtoRef.current.noteId,
          title: summaryData.title,
          summary: summaryData.summary,
        });
      },
    }
  );

  useEffect(() => {
    if (summaryData) {
      form.setFieldsValue({
        title: summaryData.title,
        summary: summaryData.summary,
      });
    }
  }, [summaryData, form]);

  const onFinish: FormProps<FieldType>['onFinish'] = values => {
    console.log('Success:', values);
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  if (!selectedAlert) return <div>No alert selected</div>;

  return waveformUrl ? (
    <Row gutter={[16, 0]}>
      <Col span={12}>
        <Row style={{ marginBottom: '12px' }}>
          <div style={{ whiteSpace: 'normal' }} dangerouslySetInnerHTML={{ __html: transformText(selectedAlert.text, selectedAlert.words) }} />
        </Row>
        <Row align='middle' justify='space-between'>
          <audio src={waveformUrl} controls style={{ width: '90%' }}>
            <track kind='captions' src='captions.vtt' label='Captions' />
            Tu navegador no soporta el elemento de audio.
          </audio>

          <Button type='primary' onClick={() => generateTranscription(getTranscriptionDto)} size='small' disabled={!!isLoadingTranscription}>
            Texto
          </Button>
        </Row>

        {errorTranscription ? (
          <div>Error cargando la transcripción</div>
        ) : (
          <Spin spinning={isLoadingTranscription}>
            <Title level={4}>Transcripción</Title>
            <TextArea
              value={transcriptionData?.text}
              placeholder='Transcripción...'
              autoSize={{ minRows: 10, maxRows: 20 }}
              style={{ height: '100%' }}
            />
          </Spin>
        )}
      </Col>
      <Col span={12}>
        {errorSummary ? (
          <div>Error cargando el resumen</div>
        ) : (
          <Form
            name='basic'
            layout='vertical'
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 20 }}
            initialValues={{ title: summaryData?.title, summary: summaryData?.summary }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete='off'
            form={form}
          >
            <Form.Item<FieldType> label='Indice' name='index' rules={[{ required: true }]}>
              <Input placeholder='NOTA_XX' />
            </Form.Item>

            <Form.Item<FieldType> label='Programa' name='program' rules={[{ required: true }]}>
              <Input placeholder='Programa...' />
            </Form.Item>
            <Spin spinning={isLoadingSummary || isLoadingTranscription}>
              <Form.Item<FieldType> label='Titular' name='title' rules={[{ required: true }]}>
                <Input placeholder='Titular...' />
              </Form.Item>
              <Form.Item<FieldType> label='Resumen' name='summary' rules={[{ required: true }]}>
                <TextArea placeholder='Resumen...' autoSize={{ minRows: 6, maxRows: 20 }} style={{ height: '100%' }} />
              </Form.Item>
            </Spin>
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type='primary' htmlType='submit'>
                Submit
              </Button>
            </Form.Item>
          </Form>
        )}
      </Col>
    </Row>
  ) : null;
};

export default SummaryEdit;
