import { useCallback, useEffect, useState } from 'react';
import Waveform from '../../components/waveform';
import { Button } from 'antd';
import { useCreateFile } from '../../services/AudioService';
import { CreateFileDto, getDateFromFile } from '@radio-alert/models';
import BarComponent from '../../components/Bar';

interface AudioEditProps {
  createFileDtoIn: CreateFileDto;
  segmentStartSeconds: number;
  segmentDuration: number;
}
const AudioEdit: React.FC<AudioEditProps> = ({ createFileDtoIn, segmentStartSeconds, segmentDuration }) => {
  const url = `${import.meta.env.VITE_API_LOCAL}audio/fetchByName/${createFileDtoIn.output}`;

  const [createFetch, setCreateFetch] = useState(false);
  const [createFileDto, setCreateFileDto] = useState<CreateFileDto>(new CreateFileDto());
  const [waveformUrl, setWaveformUrl] = useState('');

  const { data: createData, isLoading: createLoading, error: createError } = useCreateFile(createFileDto, createFetch);

  useEffect(() => {
    if (!createLoading) {
      setCreateFetch(false);
    }
  }, [createLoading]);

  const onSelection = useCallback(
    (start: number, end: number) => {
      setCreateFileDto(prevCreateFileDto => ({
        ...prevCreateFileDto,
        filePath: createFileDtoIn.filePath,
        startSecond: segmentStartSeconds + start,
        output: `fragment_${createFileDtoIn.id}`,
        duration: end - start,
        id: createFileDtoIn.id,
      }));
    },
    [createFileDtoIn, segmentStartSeconds]
  );

  const calculatePositions = () => {
    const fileTime = getDateFromFile(createFileDtoIn.filePath);

    const startTime = new Date(createFileDtoIn.startTime ?? '');

    const endTime = new Date(createFileDtoIn.endTime ?? '');
    const startSecond = (startTime.getTime() - fileTime.getTime()) / 1000 - segmentStartSeconds + 10;
    const endSecond = (endTime.getTime() - fileTime.getTime()) / 1000 - segmentStartSeconds + 10;

    const startPosition = (startSecond * 100) / segmentDuration;
    const endPosition = (endSecond * 100) / segmentDuration;
    return { startPosition, endPosition };
  };

  // Dentro de tu componente, antes del return
  const { startPosition, endPosition } = calculatePositions();

  useEffect(() => {
    if (createData) {
      setWaveformUrl(`${import.meta.env.VITE_API_LOCAL}audio/fetchByName/fragment_${createFileDto.id}?v=${Date.now()}`);
    }
  }, [createData, createFileDto.id]);

  return url ? (
    <div>
      <Waveform url={url} onSelection={onSelection} />
      <BarComponent startPosition={startPosition} endPosition={endPosition} />

      <Button
        type='primary'
        onClick={() => {
          setCreateFetch(true);
        }}
        size='small'
        disabled={createFileDto.duration <= 0}
      >
        Obtener
      </Button>

      {!createError && waveformUrl ? (
        <audio src={waveformUrl} controls>
          <track kind='captions' src='captions.vtt' label='Captions' />
          Tu navegador no soporta el elemento de audio.
        </audio>
      ) : null}
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default AudioEdit;
