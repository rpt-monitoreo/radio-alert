import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useGetAlerts, useGetDates } from '../../services/AlertsService';
import { useEffect, useState } from 'react';
import { GetAlertsDto } from '@radio-alert/models';
import AlertsTable from './AlertsTable';

// Asegúrate de tener un formato de fecha válido para dayjs
const dateFormat = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;

const Alerts = () => {
  const { data: dates, isLoading: isLoadingDates, error: datesError } = useGetDates({});
  const [selectedDates, setSelectedDates] = useState<[Dayjs | null, Dayjs | null] | null>([dayjs(), dayjs()]);
  const [tempDates, setTempDates] = useState<[Dayjs | null, Dayjs | null] | null>([dayjs(), dayjs()]);

  const [alertsParams, setAlertsParams] = useState<GetAlertsDto>({
    startDate: dayjs().format(dateFormat),
    endDate: dayjs().format(dateFormat),
  });

  useEffect(() => {
    if (!selectedDates) return;
    setAlertsParams({
      startDate: selectedDates[0]?.format(dateFormat),
      endDate: selectedDates[1]?.format(dateFormat),
    });
  }, [selectedDates, dates]);

  const { data: alerts, isLoading: isLoadingAlerts, error: alertsError } = useGetAlerts(alertsParams);

  const handleCalendarChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setTempDates(dates);
  };
  const handleOpenChange = (open: boolean) => {
    if (!open && tempDates) {
      setSelectedDates(tempDates);
    }
  };

  if (isLoadingDates || isLoadingAlerts) return <div>Loading...</div>;
  if (datesError || alertsError) return <div>Error loading data</div>;

  const minDate = dayjs(dates?.minDate, dateFormat);
  const maxDate = dayjs(dates?.maxDate, dateFormat);

  return (
    <>
      <RangePicker
        value={selectedDates || [maxDate, maxDate]}
        onChange={handleCalendarChange}
        onOpenChange={handleOpenChange}
        disabledDate={current => current < minDate || current > maxDate}
      />
      <AlertsTable alerts={alerts?.filter(alert => alert.type === 'Nueva')} />
    </>
  );
};

export default Alerts;
