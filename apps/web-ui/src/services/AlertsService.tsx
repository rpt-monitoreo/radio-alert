import axios from 'axios';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { AlertDto, GetAlertsDto, GetSummaryDto, GetTranscriptionDto, ValidDatesDto } from '@radio-alert/models';

export const useGetDates = (params: GetAlertsDto): UseQueryResult<ValidDatesDto> => {
  return useQuery(['alerts/dates', params], () => axios.post(`${import.meta.env.VITE_API_LOCAL}alerts/dates`, params).then(res => res.data));
};

export const useGetAlerts = (params: GetAlertsDto): UseQueryResult<AlertDto[]> => {
  return useQuery(['alerts', params], () => axios.post(`${import.meta.env.VITE_API_LOCAL}alerts`, params).then(res => res.data));
};

export const useGetText = (params: GetTranscriptionDto, isEnabled: boolean): UseQueryResult<string> => {
  return useQuery(['alerts/getText', params], () => axios.post(`${import.meta.env.VITE_API_LOCAL}alerts/getText`, params).then(res => res.data), {
    enabled: isEnabled,
  });
};

export const useGetSummary = (params: GetSummaryDto, isEnabled: boolean): UseQueryResult<string> => {
  return useQuery(
    ['alerts/getSummary ', params],
    () => axios.post(`${import.meta.env.VITE_API_LOCAL}alerts/getSummary `, params).then(res => res.data),
    {
      enabled: isEnabled,
    }
  );
};
