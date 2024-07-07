import { useCallback, useEffect, useState } from 'react';
import Waveform from '../../components/waveform';
import { Button, Switch } from 'antd';
import { useCreateFile } from '../../services/AudioService';
import { CreateFileDto } from '@radio-alert/models';

interface AudioEditProps {
  fileName: string;
  startSeconds: number;
  id: string;
}
const AudioEdit: React.FC<AudioEditProps> = ({ fileName, startSeconds, id }) => {
  const url = `${import.meta.env.VITE_API_LOCAL}audio/fetchByName/${fileName}`;
  const [readonly, setReadonly] = useState(false);
  const [createFetch, setCreateFetch] = useState(false);
  const [createFileDto, setCreateFileDto] = useState<CreateFileDto>(new CreateFileDto());
  const [waveformUrl, setWaveformUrl] = useState('');

  const { data: createData, isLoading: createLoading, error: createError } = useCreateFile(createFileDto, createFetch);

  const onSelection = useCallback(
    (start: number, end: number) => {
      console.log(`Selected region from ${start} to ${end}`);
      setCreateFileDto(prevCreateFileDto => ({
        ...prevCreateFileDto,
        filePath: `./audioFiles/${fileName}.mp3`,
        startSecond: startSeconds + start,
        output: `fragment_${id}`,
        duration: end - start,
        id,
      }));
    },
    [fileName, id, startSeconds]
  );

  useEffect(() => {
    if (createData) {
      setWaveformUrl(`${import.meta.env.VITE_API_LOCAL}audio/fetchByName/fragment_${createFileDto.id}`);
    }
  }, [createData, createFileDto.id]);

  return url ? (
    <div>
      <Waveform url={url} onSelection={onSelection} edit={readonly} />

      <Switch
        style={{
          marginBlockEnd: 16,
        }}
        checked={readonly}
        checkedChildren='Editar'
        unCheckedChildren='Lectura'
        onChange={setReadonly}
      />
      <Button
        type='primary'
        onClick={() => {
          setCreateFetch(true);
        }}
        size='small'
        disabled={!readonly}
      >
        Obtener
      </Button>

      {waveformUrl ? (
        <>
          <Waveform url={waveformUrl} onSelection={onSelection} edit={true} />
          <div></div>
        </>
      ) : null}
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default AudioEdit;
