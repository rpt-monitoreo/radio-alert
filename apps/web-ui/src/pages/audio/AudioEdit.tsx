import { useCallback, useEffect, useState } from 'react';
import Waveform from '../../components/waveform';
import { Button, Col, Row, Spin } from 'antd';
import { useCreateFile } from '../../services/AudioService';
import { AlertDto, CreateFileDto, getDateFromFile, GetTranscriptionDto } from '@radio-alert/models';
import BarComponent from '../../components/Bar';
import moment from 'moment';
import TextArea from 'antd/es/input/TextArea';
import { useGetSummary, useGetText } from '../../services/AlertsService';

interface AudioEditProps {
  createFileDtoIn: CreateFileDto;
  alert: AlertDto;
  segmentStartSeconds: number;
  segmentDuration: number;
}
const AudioEdit: React.FC<AudioEditProps> = ({ createFileDtoIn, alert, segmentStartSeconds, segmentDuration }) => {
  const url = `${import.meta.env.VITE_API_LOCAL}audio/fetchByName/${createFileDtoIn.output}`;

  const [createFetch, setCreateFetch] = useState(false);
  const [createFileDto, setCreateFileDto] = useState<CreateFileDto>(new CreateFileDto());

  const [getTextFetch, setGetTextFetch] = useState(false);
  const [getTextDto, setGetTextDto] = useState<GetTranscriptionDto>(new GetTranscriptionDto());

  const [waveformUrl, setWaveformUrl] = useState('');
  const [fragmentDuration, setFragmentDuration] = useState<moment.Duration>();
  const [startFragmentTime, setStartFragmentTime] = useState<Date | null>();

  const [getTextData, setGetTextData] = useState<string>();
  const [getTextLoading, setGetTextLoading] = useState(false);
  const [getTextError, setGetTextError] = useState<unknown>(null);

  const { data: createData, isLoading: createLoading, error: createError } = useCreateFile(createFileDto, createFetch);
  const { data: text, isLoading: isLoadingText, error: errorText } = useGetText(getTextDto, getTextFetch);

  //const [getSummaryFetch, setGetSummaryFetch] = useState(false);
  // const { data: summary, isLoading: isLoadingSummary, error: errorSummary } = useGetSummary({ text: text ?? '' }, getSummaryFetch);

  useEffect(() => {
    setGetTextLoading(false);
    setGetTextData('');
    setStartFragmentTime(null);
  }, []);

  useEffect(() => {
    if (!createLoading) {
      setCreateFetch(false);
    }
  }, [createLoading]);

  /* useEffect(() => {
    if (!isLoadingSummary) {
      setGetSummaryFetch(false);
    }
  }, [isLoadingSummary]); */

  useEffect(() => {
    setGetTextData(text);
    setGetTextLoading(isLoadingText);
    setGetTextError(errorText);
  }, [text, isLoadingText, errorText]);

  const onSelection = useCallback(
    (start: number, end: number) => {
      setFragmentDuration(moment.duration(end - start, 'seconds'));
      setCreateFileDto(prevCreateFileDto => ({
        ...prevCreateFileDto,
        filePath: createFileDtoIn.filePath,
        startSecond: segmentStartSeconds + start,
        output: `fragment_${createFileDtoIn.id}`,
        duration: end - start,
        id: createFileDtoIn.id,
      }));
      const fileTime = getDateFromFile(createFileDtoIn.filePath);
      fileTime.setUTCHours(fileTime.getUTCHours() + 5);
      setStartFragmentTime(new Date(fileTime.getTime() + (segmentStartSeconds + start) * 1000));
    },
    [createFileDtoIn, segmentStartSeconds]
  );

  const calculatePositions = () => {
    const fileTime = getDateFromFile(createFileDtoIn.filePath);

    const startTime = new Date(createFileDtoIn.startTime ?? '');
    const endTime = new Date(createFileDtoIn.endTime ?? '');

    const startSecond = (startTime.getTime() - fileTime.getTime()) / 1000 - segmentStartSeconds;
    const endSecond = (endTime.getTime() - fileTime.getTime()) / 1000 - segmentStartSeconds;

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

  const getTextClick = async () => {
    setGetTextDto((prevGetTextDto: GetTranscriptionDto) => ({
      ...prevGetTextDto,
      filename: `fragment_${alert.id}.wav`,
      words: alert.words,
    }));
    setGetTextFetch(!getTextFetch);
  };

  useEffect(() => {
    if (!getTextLoading) {
      setGetTextFetch(false);
    }
  }, [getTextLoading]);
  /* useEffect(() => {
    setGetSummaryFetch(true);
  }, [text]); */

  return url ? (
    <div>
      <Waveform url={url} onSelection={onSelection} />
      <BarComponent startPosition={startPosition} endPosition={endPosition} />
      <Row align='middle'>
        <Col span={4}>
          <div>{'Fecha: ' + (startFragmentTime ? moment(startFragmentTime).format('YYYY-MM-DD') : '')}</div>
          <div>{'Inicio: ' + (startFragmentTime ? moment(startFragmentTime).format('HH:mm:ss') : '')}</div>
          <div>{`Duración: ${startFragmentTime ? moment.utc(fragmentDuration?.asMilliseconds()).format('HH:mm:ss') : ''}`}</div>
          <Button
            type='primary'
            onClick={() => {
              setCreateFetch(true);
              setGetTextFetch(false);
              setGetTextData('');
            }}
            size='small'
            disabled={!createFileDto.duration || createFileDto.duration === 0}
          >
            Audio
          </Button>
        </Col>
        {!createError && waveformUrl ? (
          <Col span={20}>
            <Row align='middle'>
              <audio src={waveformUrl} controls>
                <track kind='captions' src='captions.vtt' label='Captions' />
                Tu navegador no soporta el elemento de audio.
              </audio>

              <Button type='primary' onClick={getTextClick} size='small' disabled={!!getTextLoading}>
                Texto
              </Button>
            </Row>
            <Row align='middle'>
              <Col span={12}>
                <TextArea value={getTextData ?? ''} placeholder='Escribe aquí...' rows={4} />
              </Col>

              <Spin spinning={getTextLoading}></Spin>
              {/*  <Col span={12}>{summary && <TextArea value={summary} placeholder='Escribe aquí...' rows={4} />}</Col> */}
            </Row>
          </Col>
        ) : null}
      </Row>
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default AudioEdit;
