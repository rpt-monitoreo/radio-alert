import React, { useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, message, Modal, Row, Spin, Steps } from 'antd';
import { useAlert } from './AlertsContext';
import { useMutation, UseMutationResult } from 'react-query';
import { CreateFileDto, FileDto, Fragment } from '@radio-alert/models';
import axios from 'axios';
import AudioEdit from '../audio/AudioEdit';
import moment from 'moment';
import SummaryEdit from '../notes/SummaryEdit';
import { useNote } from '../notes/NoteContext';

interface AlertsModalProps {
  visible: boolean;
  onClose: () => void;
}

const useCreateFileMutation = (createFileDto: CreateFileDto) => {
  return useMutation<FileDto, unknown, CreateFileDto, unknown>(async () => {
    const response = await axios.post(`${import.meta.env.VITE_API_LOCAL}audio/createFile`, createFileDto);
    return response.data;
  });
};
type CreateFileMutationResult = UseMutationResult<FileDto, unknown, CreateFileDto, unknown>;

const AlertsModal: React.FC<AlertsModalProps> = ({ visible, onClose }) => {
  const { selectedAlert } = useAlert();
  const { note, setNote } = useNote();
  const [fragment, setFragment] = useState<Fragment>(new Fragment());
  const [createFragmentDto, setCreateFragmentDto] = useState<CreateFileDto>(new CreateFileDto());
  const [formSummary] = Form.useForm();

  const createSegmentDto = useMemo(
    () => ({
      alert: selectedAlert,
      output: `segment_${selectedAlert?.id}`,
      duration: 1800,
    }),
    [selectedAlert]
  );

  const {
    mutateAsync: createSegmentFile,
    data: segmentData,
    isLoading: isLoadingSegment,
    error: errorSegment,
  }: CreateFileMutationResult = useCreateFileMutation(createSegmentDto);

  const {
    mutateAsync: createFragmentFile,
    data: fragmentData,
    isLoading: isLoadingFragment,
    error: errorFragment,
  }: CreateFileMutationResult = useCreateFileMutation(createFragmentDto);

  useEffect(() => {
    if (visible) {
      setFragment(new Fragment());
      setCreateFragmentDto(new CreateFileDto());
      createSegmentFile(createSegmentDto);
    }
  }, [visible, createSegmentFile, createSegmentDto]);

  const handleCreateFragment = (createFileDto: CreateFileDto, fragment: Fragment) => {
    setFragment(fragment);
    setCreateFragmentDto(createFileDto);
  };

  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (current === 1) {
      createFragmentFile(createFragmentDto);
    }
  }, [createFragmentDto, createFragmentFile, current]);

  const next = () => {
    if (current === 1) {
      formSummary.validateFields().then(values => {
        setNote({
          ...note,
          index: values.index,
          program: values.program,
          title: values.title,
          summary: values.summary,
        });
        setCurrent(current + 1);
      });
    } else {
      setCurrent(current + 1);
    }
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const steps = [
    {
      title: 'Editar Audio',
      content: errorSegment ? (
        <div>Error loading Segment</div>
      ) : (
        segmentData && (
          <AudioEdit segmentData={segmentData} audioFile={createSegmentDto.output} onCreateFragmentDto={handleCreateFragment}></AudioEdit>
        )
      ),
    },
    {
      title: 'Resumen',
      content: errorFragment ? (
        <div>Error loading Fragment</div>
      ) : (
        segmentData && <Spin spinning={isLoadingFragment}>{fragmentData && <SummaryEdit form={formSummary}></SummaryEdit>}</Spin>
      ),
    },
    {
      title: 'Nota',
      content: 'Last-content22',
    },
  ];

  const items = steps.map(item => ({ key: item.title, title: item.title }));

  if (!selectedAlert) return <div>No alert selected</div>;

  function isStepInvalid(): boolean {
    let value = true;
    switch (current) {
      case 0:
        value = !createFragmentDto.duration || createFragmentDto.duration === 0;
        break;
      case 1:
        value = !note?.id;
        break;
      case 2:
        value = !note?.id;
        break;
      default:
        break;
    }
    return value;
  }

  return (
    <Modal
      open={visible}
      title={`${selectedAlert.platform} - ${selectedAlert.clientName}`}
      loading={isLoadingSegment}
      onCancel={onClose}
      onClose={onClose}
      width='100vw'
      destroyOnClose={true}
      footer={null}
    >
      <>
        <Steps current={current} items={items} size='small' />
        <div style={{ minHeight: '300px', marginTop: '20px' }}>{steps[current].content}</div>
        <Row style={{ marginTop: 24 }}>
          <Col span={3}>
            <Button size='small' style={{ margin: '0 8px' }} onClick={() => prev()} disabled={current === 0}>
              {current > 0 ? 'Previous' : '_________'}
            </Button>
            {current < steps.length - 1 && (
              <Button type='primary' onClick={() => next()} size='small' disabled={isStepInvalid()}>
                Next
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button type='primary' onClick={() => message.success('Processing complete!')} size='small'>
                Done
              </Button>
            )}
          </Col>

          <Col span={3}>
            <div>{'Fecha: ' + (fragment.startTime ? moment(fragment.startTime).format('YYYY-MM-DD') : '')}</div>
          </Col>
          <Col span={3}>
            <div>{'Inicio: ' + (fragment.startTime ? moment(fragment.startTime).format('HH:mm:ss') : '')}</div>
          </Col>
          <Col span={3}>
            <div>{`Duración: ${fragment.startTime ? moment.utc(fragment.duration?.asMilliseconds()).format('HH:mm:ss') : ''}`}</div>
          </Col>
        </Row>
      </>
    </Modal>
  );
};

export default AlertsModal;
