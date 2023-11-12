import React from 'react';
import Item from './Item';
import { theme } from 'antd';
import { v4 as uuidv4 } from 'uuid';

const List: React.FC<{
  title: string;
  style?: React.CSSProperties;
}> = props => {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        width: '100%',
        ...props.style,
      }}
    >
      <div
        style={{
          fontSize: 16,
          color: token.colorTextHeading,
          lineHeight: '24px',
          fontWeight: 500,
          marginBlockEnd: 16,
        }}
      >
        {props.title}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        {new Array(6).fill(1).map((_, index) => {
          return <Item key={uuidv4()}>soluciones especificas-{index}</Item>;
        })}
      </div>
    </div>
  );
};

export default List;
