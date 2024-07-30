import { useCallback, useEffect, useState } from "react";
import Waveform from "../../components/waveform";
import { Col, Row } from "antd";
import {
  CreateFileDto,
  getDateFromFile,
  FileDto,
  Fragment,
  transformText,
} from "@repo/shared/index";
import BarComponent from "../../components/Bar";
import moment from "moment";
import { useAlert } from "../alerts/AlertsContext";

interface AudioEditProps {
  audioFile: string;
  segmentData: FileDto;
  onCreateFragmentDto: (
    createFragmentDto: CreateFileDto,
    fragment: Fragment
  ) => void;
}
const AudioEdit: React.FC<AudioEditProps> = ({
  audioFile,
  segmentData,
  onCreateFragmentDto: onCreateFileDto,
}) => {
  const { selectedAlert } = useAlert();

  const url = `${import.meta.env.VITE_API_LOCAL}/audio/fetchByName/${audioFile}`;

  const [createFileDto, setCreateFileDto] = useState<CreateFileDto>(
    new CreateFileDto()
  );
  const [fragment, setFragment] = useState<Fragment>(new Fragment());

  const onSelection = useCallback(
    (start: number, end: number) => {
      const fileTime = getDateFromFile(selectedAlert?.filePath ?? "");
      fileTime.setUTCHours(fileTime.getUTCHours() + 5);

      setFragment((prevFragment) => ({
        ...prevFragment,
        startTime: new Date(
          fileTime.getTime() + segmentData.startSeconds * 1000
        ),
        duration: moment.duration(end - start, "seconds"),
      }));

      setCreateFileDto((prevCreateFileDto) => ({
        ...prevCreateFileDto,
        alert: selectedAlert,
        startSecond: segmentData.startSeconds,
        output: `fragment_${selectedAlert?.id}`,
        duration: end - start,
      }));
    },
    [selectedAlert, segmentData]
  );

  useEffect(() => {
    if (createFileDto.alert) {
      onCreateFileDto(createFileDto, fragment);
    }
  }, [createFileDto, onCreateFileDto, fragment]);

  if (!selectedAlert) return <div>No alert selected</div>;

  const calculatePositions = () => {
    const fileTime = getDateFromFile(selectedAlert.filePath ?? "");

    const startTime = new Date(selectedAlert.startTime ?? "");
    const endTime = new Date(selectedAlert.endTime ?? "");

    const startSecond =
      10 +
      (startTime.getTime() - fileTime.getTime()) / 1000 -
      segmentData.startSeconds;
    const endSecond =
      10 +
      (endTime.getTime() - fileTime.getTime()) / 1000 -
      segmentData.startSeconds;

    const startPosition = (startSecond * 100) / segmentData.duration;
    const endPosition = (endSecond * 100) / segmentData.duration;
    return { startPosition, endPosition };
  };

  const { startPosition, endPosition } = calculatePositions();

  return (
    <Row align="middle">
      <Col span={24} style={{ marginBottom: "12px" }}>
        <div
          style={{ whiteSpace: "normal" }}
          dangerouslySetInnerHTML={{
            __html: transformText(
              selectedAlert.text ?? "",
              selectedAlert.words ?? []
            ),
          }}
        />
      </Col>
      <Col span={24}>
        <Waveform url={url} onSelection={onSelection} />
        <BarComponent startPosition={startPosition} endPosition={endPosition} />
      </Col>
    </Row>
  );
};

export default AudioEdit;
