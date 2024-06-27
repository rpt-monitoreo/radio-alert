import axios from 'axios';
import { UseQueryResult, useQuery } from 'react-query';
import { AlertDto, GetAlertsDto, ValidDatesDto } from '@radio-alert/models';

export const useGetDates = (params: GetAlertsDto): UseQueryResult<ValidDatesDto> => {
  return useQuery(['alerts/dates', params], () =>
    axios.post(`${import.meta.env.VITE_API_LOCAL}alerts/dates`, params).then(res => res.data)
  );
};

export const useGetAlerts = (params: GetAlertsDto): UseQueryResult<AlertDto[]> => {
  return useQuery(['alerts', params], () =>
    axios.post(`${import.meta.env.VITE_API_LOCAL}alerts`, params).then(res => res.data)
  );
};
