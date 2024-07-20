import React from 'react';
import { Modal } from 'antd';
import { useAlert } from './AlertsContext';
import { useQuery, UseQueryResult } from 'react-query';
import { CreateFileDto, FileDto } from '@radio-alert/models';
import axios from 'axios';
import AudioEdit from '../audio/AudioEdit';

interface AlertsModalProps {
  visible: boolean;
  onClose: () => void;
}

const AlertsModal: React.FC<AlertsModalProps> = ({ visible, onClose }) => {
  const { selectedAlert } = useAlert();

  const segmentPath = `segment_${selectedAlert?.id}`;
  const {
    data: segmentData,
    isLoading: isLoadingSegment,
    error: errorSegment,
  }: UseQueryResult<FileDto> = useQuery<FileDto>({
    queryKey: ['segment'],
    queryFn: async () =>
      await axios
        .post(`${import.meta.env.VITE_API_LOCAL}audio/createFile`, {
          alert: selectedAlert,
          output: segmentPath,
          duration: 1800,
        })
        .then(res => res.data),
    enabled: visible,
  });
  const handleCreateFileDto = (createFileDto: CreateFileDto) => {
    console.log('Received createFileDto:', createFileDto);
    // Handle the createFileDto as needed
  };

  /*  const {
    data: fragmentData,
    isLoading: isLoadingFragment,
    error: errorFragment,
    refetch,
  }: UseQueryResult<FileDto> = useQuery<FileDto>({
    queryKey: ['fragment'],
    queryFn: async () => await axios.post(`${import.meta.env.VITE_API_LOCAL}audio/createFile`, createFileDto).then(res => res.data),
    enabled: false,
  });

  const onClick = () => {
    refetch();
  }; */

  if (!selectedAlert) return <div>No alert selected</div>;

  return (
    <Modal
      open={visible}
      title={selectedAlert.clientName}
      loading={isLoadingSegment}
      onCancel={onClose}
      onClose={onClose}
      width='100vw'
      destroyOnClose={true}
      footer={null}
    >
      {errorSegment ? (
        <div>Error loading Segment</div>
      ) : (
        segmentData && <AudioEdit segmentData={segmentData} audioFile={segmentPath} onCreateFileDto={handleCreateFileDto}></AudioEdit>
      )}
    </Modal>
  );
};

export default AlertsModal;
