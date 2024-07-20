import { useCallback, useState } from 'react';
import Waveform from '../../components/waveform';
import { Button, Col, Row } from 'antd';
import { CreateFileDto, getDateFromFile, FileDto } from '@radio-alert/models';
import BarComponent from '../../components/Bar';
import moment from 'moment';
import { useAlert } from '../alerts/AlertsContext';

interface AudioEditProps {
  audioFile: string;
  segmentData: FileDto;
  onCreateFileDto: (createFileDto: CreateFileDto) => void;
}
const AudioEdit: React.FC<AudioEditProps> = ({ audioFile, segmentData, onCreateFileDto }) => {
  const { selectedAlert } = useAlert();

  const url = `${import.meta.env.VITE_API_LOCAL}audio/fetchByName/${audioFile}`;

  const [createFileDto, setCreateFileDto] = useState<CreateFileDto>(new CreateFileDto());
  const [fragmentDuration, setFragmentDuration] = useState<moment.Duration>();
  const [startFragmentTime, setStartFragmentTime] = useState<Date | null>();

  const onSelection = useCallback(
    (start: number, end: number) => {
      setFragmentDuration(moment.duration(end - start, 'seconds'));
      setCreateFileDto(prevCreateFileDto => ({
        ...prevCreateFileDto,
        alert: selectedAlert,
        startSecond: segmentData.startSeconds + start,
        output: `fragment_${selectedAlert?.id}`,
        duration: end - start,
      }));
      const fileTime = getDateFromFile(selectedAlert?.filePath ?? '');
      fileTime.setUTCHours(fileTime.getUTCHours() + 5);
      setStartFragmentTime(new Date(fileTime.getTime() + (segmentData.startSeconds + start) * 1000));
    },
    [selectedAlert, segmentData.startSeconds]
  );

  const onClick = () => {
    onCreateFileDto(createFileDto); // Send createFileDto back to parent
  };

  if (!selectedAlert) return <div>No alert selected</div>;

  const calculatePositions = () => {
    const fileTime = getDateFromFile(selectedAlert.filePath ?? '');

    const startTime = new Date(selectedAlert.startTime ?? '');
    const endTime = new Date(selectedAlert.endTime ?? '');

    const startSecond = (startTime.getTime() - fileTime.getTime()) / 1000 - segmentData.startSeconds;
    const endSecond = (endTime.getTime() - fileTime.getTime()) / 1000 - segmentData.startSeconds;

    const startPosition = (startSecond * 100) / segmentData.duration;
    const endPosition = (endSecond * 100) / segmentData.duration;
    return { startPosition, endPosition };
  };

  const { startPosition, endPosition } = calculatePositions();

  return (
    <>
      <Waveform url={url} onSelection={onSelection} />
      <BarComponent startPosition={startPosition} endPosition={endPosition} />
      <Row align='middle'>
        <Col span={4}>
          <div>{'Fecha: ' + (startFragmentTime ? moment(startFragmentTime).format('YYYY-MM-DD') : '')}</div>
          <div>{'Inicio: ' + (startFragmentTime ? moment(startFragmentTime).format('HH:mm:ss') : '')}</div>
          <div>{`Duración: ${startFragmentTime ? moment.utc(fragmentDuration?.asMilliseconds()).format('HH:mm:ss') : ''}`}</div>
          <Button type='primary' onClick={onClick} size='small' disabled={!createFileDto.duration || createFileDto.duration === 0}>
            Audio
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default AudioEdit;
