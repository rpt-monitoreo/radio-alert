import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Col, Form, FormInstance, FormProps, Input, Row, Select, Spin } from 'antd';
import { GetSummaryDto, GetTranscriptionDto, PlatformDto, Slot, SummaryDto, TranscriptionDto, transformText } from '@radio-alert/models';
import TextArea from 'antd/es/input/TextArea';
import { useAlert } from '../alerts/AlertsContext';
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from 'react-query';
import api from '../../services/Agent';
import Title from 'antd/es/typography/Title';
import { useNote } from './NoteContext';
import moment from 'moment';

const { Option } = Select;

type TranscriptionMutationResult = UseMutationResult<TranscriptionDto, unknown, GetTranscriptionDto, unknown>;
type SummaryMutationResult = UseMutationResult<SummaryDto, unknown, GetSummaryDto, unknown>;

type FieldType = {
  index?: string;
  program?: string;
  audioLabel?: string;
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
  const [programOptions, setProgramOptions] = useState<string[]>([]);

  const slotsRef = useRef<Slot[]>([]);

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
    data: platforms,
    isLoading: isLoadingPlatforms,
    error: errorPlatforms,
  }: UseQueryResult<PlatformDto[]> = useQuery({
    queryKey: ['platforms'],
    queryFn: async () => await api.get(`${import.meta.env.VITE_API_LOCAL}settings/get-platforms/${selectedAlert?.media}`).then(res => res.data),
  });

  useEffect(() => {
    slotsRef.current = platforms?.filter(platform => platform.name === selectedAlert?.platform)[0]?.slots ?? [];
    const startTime = moment(note?.startTime);
    const dayOfWeek = startTime.day();

    let dayType: string;
    if (dayOfWeek === 0) {
      dayType = 'sunday';
    } else if (dayOfWeek === 6) {
      dayType = 'saturday';
    } else {
      dayType = 'weekday';
    }

    const defaultSlot = slotsRef.current
      ?.filter(slot => slot.day === dayType)
      .find(slot => {
        const slotStartTime = moment(slot.start, 'HH:mm');
        const slotEndTime = moment(slot.end, 'HH:mm');
        // Check if startTime is between slot's start and end times, inclusive
        return startTime.isBetween(slotStartTime, slotEndTime, null, '[]');
      });

    form.setFieldsValue({
      program: defaultSlot?.label,
    });
    setNote({
      ...note,
      audioLabel: defaultSlot?.audioLabel,
    });

    if (slotsRef.current.length === 0) return;
    setProgramOptions(slotsRef.current.map(slot => slot.label ?? ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, platforms, selectedAlert?.platform]);

  const {
    mutateAsync: generateTranscription,
    data: transcriptionData,
    isLoading: isLoadingTranscription,
    error: errorTranscription,
  }: TranscriptionMutationResult = useMutation<TranscriptionDto, unknown, GetTranscriptionDto, unknown>(
    async () => {
      const response = await api.post(`${import.meta.env.VITE_API_LOCAL}alerts/getText`, getTranscriptionDto);
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
      const response = await api.post(`${import.meta.env.VITE_API_LOCAL}alerts/getSummary`, getSummaryDtoRef.current);
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

  const handleProgramChange = (value: string) => {
    const slot = slotsRef.current.find(slot => slot.label === value);
    setNote({
      ...note,
      audioLabel: slot?.audioLabel,
    });
  };

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
          <div
            style={{ whiteSpace: 'normal' }}
            dangerouslySetInnerHTML={{ __html: transformText(selectedAlert.text ?? '', selectedAlert.words ?? []) }}
          />
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
            <Form.Item<FieldType>
              label='NOTA'
              name='index'
              rules={[
                { required: true },
                {
                  validator: (_, value) => (/^\d*$/.test(value) ? Promise.resolve() : Promise.reject(new Error('Debe ser numérico'))),
                  message: 'Debe ser numérico',
                },
                {
                  validator: (_, value) =>
                    value && value.length >= 2 ? Promise.resolve() : Promise.reject(new Error('Debe tener al menos 2 números')),
                  message: 'Debe tener al menos 2 números',
                },
              ]}
              validateTrigger='onChange'
            >
              <Input placeholder='XX' />
            </Form.Item>

            {errorPlatforms ? (
              <div>Error cargando plataformas</div>
            ) : (
              <Spin spinning={isLoadingPlatforms}>
                <Form.Item<FieldType> label='Programa' name='program' rules={[{ required: true }]}>
                  <Select
                    placeholder='Seleccione un programa...'
                    showSearch
                    filterOption={(input, option) => String(option?.value)?.toLowerCase().includes(input.toLowerCase())}
                    onChange={handleProgramChange}
                  >
                    {programOptions.map((option, _) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Spin>
            )}

            <Spin spinning={isLoadingSummary || isLoadingTranscription}>
              <Form.Item<FieldType> label='Titular' name='title' rules={[{ required: true }]}>
                <Input placeholder='Titular...' />
              </Form.Item>
              <Form.Item<FieldType> label='Resumen' name='summary' rules={[{ required: true }]}>
                <TextArea placeholder='Resumen...' autoSize={{ minRows: 6, maxRows: 20 }} style={{ height: '100%' }} />
              </Form.Item>
            </Spin>
          </Form>
        )}
      </Col>
    </Row>
  ) : null;
};

export default SummaryEdit;
