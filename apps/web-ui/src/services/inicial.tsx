import axios from 'axios';
import { useQuery } from 'react-query';

export function useFetchUsers() {
  return useQuery('users', () => axios.get(import.meta.env.VITE_API_LOCAL).then(res => res.data));
}
