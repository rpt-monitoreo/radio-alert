import React from 'react';
import { Modal } from 'antd';

interface AlertsModalProps {
  visible: boolean;
  onClose: () => void;
}

const AlertsModal: React.FC<AlertsModalProps> = ({ visible, onClose }) => {
  return (
    <>
      <Modal open={visible} title={'title'} onCancel={onClose} footer={null}>
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
