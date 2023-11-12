import { useCallback, useState } from 'react';
import Waveform from '../components/waveform';
import { Switch } from 'antd';

const ParentComponent = () => {
  const url = import.meta.env.VITE_API_BASE_URL + 'audio';
  const [readonly, setReadonly] = useState(false);

  const onSelection = useCallback((start: number, end: number) => {
    console.log(`Selected region from ${start} to ${end}`);
  }, []);

  return url ? (
    <div>
      <Waveform url={url} onSelection={onSelection} edit={readonly} />

      <Switch
        style={{
          marginBlockEnd: 16,
        }}
        checked={readonly}
        checkedChildren="Editar"
        unCheckedChildren="Lectura"
        onChange={setReadonly}
      />
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default ParentComponent;
