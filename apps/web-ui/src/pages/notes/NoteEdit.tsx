import { CreateFileDto } from '@radio-alert/models';

interface AudioEditProps {
  createFileDtoIn: CreateFileDto;
}
const AudioEdit: React.FC<AudioEditProps> = ({ createFileDtoIn }) => {
  const url = `${import.meta.env.VITE_API_LOCAL}audio/fetchByName/${createFileDtoIn.output}`;

  return url ? <div>NOTE EDIT</div> : <div>Loading...</div>;
};

export default AudioEdit;
