import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { AlertDto, CreateFileDto } from '@radio-alert/models';
import { SearchOutlined, EditOutlined } from '@ant-design/icons';
import type { InputRef, TableColumnsType, TableColumnType, TableProps } from 'antd';
import { Button, Input, Modal, Space, Table } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { useCreateFile, useDeleteFile } from '../../services/AudioService';
import AudioEdit from '../audio/AudioEdit';

// Función para formatear la fecha asumiendo que es UTC
const getDateOffset = (dateString: string | Date | dayjs.Dayjs) => {
  const date = dayjs(dateString);
  const dateWithFixedOffset = date.add(5, 'hour');
  return dateWithFixedOffset;
};

interface AlertsTableProps {
  alerts: AlertDto[] | undefined;
}
type DataIndex = keyof AlertDto;

const AlertsTable: React.FC<AlertsTableProps> = ({ alerts }) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [createFetch, setCreateFetch] = useState(false);
  const [deleteFetch, setDeleteFetch] = useState(false);
  const [createFileDto, setCreateFileDto] = useState<CreateFileDto>(new CreateFileDto());
  const [audioEditKey, setAudioEditKey] = useState(0);

  const { data: createData, isLoading: createLoading, error: createError } = useCreateFile(createFileDto, createFetch);
  const { data: deleteData, error: deleteError } = useDeleteFile(createFileDto?.output, deleteFetch);

  useEffect(() => {
    setDeleteFetch(false);
  }, [deleteData, deleteError]);

  const searchInput = useRef<InputRef>(null);

  const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps['confirm'], dataIndex: DataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<AlertDto> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={e => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type='primary'
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size='small'
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size='small' style={{ width: 90 }}>
            Reset
          </Button>
          <Button
            type='link'
            size='small'
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type='link'
            size='small'
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleClick = (alert: AlertDto) => {
    setAudioEditKey(prevKey => prevKey + 1);
    setCreateFileDto({
      filePath: alert.filePath,
      startTime: alert.startTime,
      endTime: alert.endTime,
      output: `segment_${alert.id}`,
      duration: 1800,
      id: alert.id,
    });
    setCreateFetch(true);
    setModalOpen(true);
  };

  const handleClose = () => {
    setCreateFetch(false);
    setModalOpen(false);
    // setDeleteFetch(true);
  };

  useEffect(() => {
    if (!createLoading) {
      setCreateFetch(false);
    }
  }, [createLoading]);

  if (!alerts) return null;
  const columns: TableColumnsType<AlertDto> = [
    {
      title: 'Cliente',
      dataIndex: 'clientName',
      key: 'clientName',
      filters: [
        { text: 'Ecopetrol', value: 'Ecopetrol' },
        { text: 'Anthony', value: 'Anthony' },
      ],
      onFilter: (value, record) => record.clientName.includes(value as string),
      sorter: (a, b) => a.clientName.length - b.clientName.length,
      ellipsis: true,
      width: '100px',
    },
    {
      title: 'Plataforma',
      dataIndex: 'platform',
      key: 'platform',
      ...getColumnSearchProps('platform'),
      sorter: (a, b) => a.platform.length - b.platform.length,
      ellipsis: true,
      width: '150px',
    },
    {
      title: 'Fecha',
      dataIndex: 'startTime',
      key: 'startTime',
      //sorter: (a, b) => a.startTime.getTime() - b.startTime.getTime(),
      render: text => getDateOffset(text).format('DD/MM/YY'),
      ellipsis: true,
      width: '100px',
    },
    {
      title: 'Hora',
      dataIndex: 'startTime',
      key: 'startTime',
      //sorter: (a, b) => a.startTime.getTime() - b.startTime.getTime(),
      render: text => getDateOffset(text).format('HH:mm:ss'),
      ellipsis: true,
      width: '100px',
    },
    {
      title: 'Palabras',
      dataIndex: 'words',
      key: 'words',
      ...getColumnSearchProps('text'),
      render: words => words.join(', '),
      ellipsis: true,
      width: '100px',
    },
    {
      title: 'Texto',
      dataIndex: 'text',
      key: 'text',
      ...getColumnSearchProps('text'),
      render: (text, record) => {
        // Function to check and transform text
        const transformText = (inputText: string) => {
          let transformedText = '';
          let currentIndex = 0;

          while (currentIndex < inputText.length) {
            let found = false;

            // Sort record.words by length in descending order to prioritize longer phrases
            const sortedWords = [...record.words].sort((a, b) => b.length - a.length);

            for (const phrase of sortedWords) {
              // Check if the current segment of text starts with the phrase
              if (inputText.slice(currentIndex).toLowerCase().startsWith(phrase.toLowerCase())) {
                // Transform the phrase to uppercase and apply bold style
                transformedText += `<strong style="text-transform: uppercase;">${inputText.slice(
                  currentIndex,
                  currentIndex + phrase.length
                )}</strong>`;
                currentIndex += phrase.length;
                found = true;
                break; // Break after the first match to avoid overlapping transformations
              }
            }

            // If no matching phrase is found, move to the next character
            if (!found) {
              transformedText += inputText[currentIndex];
              currentIndex++;
            }
          }

          return transformedText;
        };

        // Apply the transformation
        const finalTransformedText = transformText(text);

        // Return the transformed text as HTML
        return <div style={{ whiteSpace: 'normal' }} dangerouslySetInnerHTML={{ __html: finalTransformedText }} />;
      },
    },
    /* {
      title: 'Archivo',
      dataIndex: 'filePath',
      key: 'filePath',
      ellipsis: true,
      width: '30%',
    }, */
    {
      title: 'Editar',
      dataIndex: 'filePath',
      key: 'filePath',
      ellipsis: true,
      render: (_, record) => <Button icon={<EditOutlined />} onClick={() => handleClick(record)}></Button>,
      width: '60px',
    },
  ];

  const tableProps: TableProps<AlertDto> = {
    size: 'small',
    rowKey: 'id',
    columns: columns,
    dataSource: alerts,
    pagination: { pageSize: 20 },
  };

  return (
    <>
      <Table {...tableProps} />
      <Modal
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
            segmentStartSeconds={createData.startSeconds}
            segmentDuration={createData.duration}
          ></AudioEdit>
        ) : (
          <div>Error creating file</div>
        )}
      </Modal>
    </>
  );
};

export default AlertsTable;
