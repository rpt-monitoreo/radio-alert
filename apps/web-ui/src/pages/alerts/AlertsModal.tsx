import React from 'react';
import { Modal } from 'antd';
import { useAlert } from './AlertsContext';

interface AlertsModalProps {
  visible: boolean;
  onClose: () => void;
}

const AlertsModal: React.FC<AlertsModalProps> = ({ visible, onClose }) => {
  const { selectedAlert } = useAlert();

  if (!selectedAlert) {
    return <div>No alert selected</div>;
  }
  return (
    <>
      <Modal open={visible} title={selectedAlert.clientName} onCancel={onClose} footer={null}>
        {<div>content</div>}
      </Modal>
      {/* <Modal
    title='Vertically centered modal dialog'
    centered
    open={modalOpen}
    loading={createLoading}
    onCancel={() => handleClose()}
    onClose={() => handleClose()}
    destroyOnClose={true}
    width='100vw'
  >
    {createData && !createError ? (
      <AudioEdit
        key={audioEditKey}
        createFileDtoIn={createFileDto}
        alert={alertSeleted}
        segmentStartSeconds={createData.startSeconds}
        segmentDuration={createData.duration}
      ></AudioEdit>
    ) : (
      <div>Error creating file</div>
    )}
  </Modal> */}
    </>
  );
};

export default AlertsModal;
