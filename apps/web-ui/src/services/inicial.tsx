import axios from 'axios';
import { useQuery } from 'react-query';

export function useFetchUsers() {
  return useQuery('users', () =>
    axios.get(import.meta.env.VITE_API_BASE_URL).then(res => res.data),
  );
}
