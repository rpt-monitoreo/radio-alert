import axios from 'axios';
import { UseQueryResult, useQuery } from 'react-query';
import { CreateFileDto } from '@radio-alert/models';

export const useCreateFile = (params: CreateFileDto, isEnabled: boolean): UseQueryResult<{ startSeconds: number }> => {
  return useQuery(
    ['audio/createFile', params],
    () => axios.post(`${import.meta.env.VITE_API_LOCAL}audio/createFile`, params).then(res => res.data),
    {
      enabled: isEnabled, // Only run the query if isEnabled is true
    }
  );
};

export const useDeleteFile = (fileName: string, isEnabled: boolean): UseQueryResult<{ startSeconds: number }> => {
  return useQuery(
    [`audio/deleteByName/${fileName}`],
    () => axios.delete(`${import.meta.env.VITE_API_LOCAL}audio/deleteByName/${fileName}`).then(res => res.data),
    {
      enabled: isEnabled,
    }
  );
};
