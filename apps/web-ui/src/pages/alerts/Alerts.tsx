import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { AlertDto, GetAlertsDto, ValidDatesDto } from '@radio-alert/models';
import AlertsTable from './AlertsTable';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';

// Asegúrate de tener un formato de fecha válido para dayjs
const dateFormat = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;

const Alerts = () => {
  const {
    data: dates,
    isLoading: isLoadingDates,
    error: errorDates,
  }: UseQueryResult<ValidDatesDto> = useQuery({
    queryKey: ['dates'],
    queryFn: async () => await axios.post(`${import.meta.env.VITE_API_LOCAL}alerts/dates`, {}),
  });

  const [selectedDates, setSelectedDates] = useState<[Dayjs | null, Dayjs | null] | null>([dayjs(), dayjs()]);

  const alertsParamsRef = useRef<GetAlertsDto>({
    startDate: dayjs().format(dateFormat),
    endDate: dayjs().format(dateFormat),
  });

  useEffect(() => {
    if (!selectedDates) return;
    alertsParamsRef.current = {
      startDate: selectedDates?.[0]?.format(dateFormat),
      endDate: selectedDates?.[1]?.format(dateFormat),
    };
  }, [selectedDates, dates]);

  const {
    data: alerts,
    isLoading: isLoadingAlerts,
    error: errorAlerts,
  }: UseQueryResult<AlertDto[]> = useQuery<AlertDto[]>({
    queryKey: ['alerts', selectedDates],
    queryFn: async () =>
      await axios.post(`${import.meta.env.VITE_API_LOCAL}alerts`, {
        startDate: selectedDates?.[0]?.format(dateFormat),
        endDate: selectedDates?.[1]?.format(dateFormat),
      }),
  });

  const handleCalendarChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setSelectedDates(dates);
  };

  useEffect(() => {
    console.log(alerts);
  }, [alerts]);
  /*  if (isLoadingDates || isLoadingAlerts) return <div>Loading...</div>;
  if (datesError || alertsError) return <div>Error loading data</div>;
 */
  const minDate = dayjs(dates?.minDate, dateFormat);
  const maxDate = dayjs(dates?.maxDate, dateFormat);

  return (
    <>
      <RangePicker
        value={selectedDates || [maxDate, maxDate]}
        onChange={handleCalendarChange}
        disabledDate={current => current < minDate || current > maxDate}
        allowClear={false}
      />
      {/*  {isLoadingAlerts ? (
        <p>Loading...</p>
      ) : errorAlerts ? (
        <p>Error fetching alerts: {errorAlerts.message}</p>
      ) : (
        <AlertsTable alerts={alerts?.filter(alert => alert.type === 'Nueva')} />
      )} */}
    </>
  );
};

export default Alerts;
