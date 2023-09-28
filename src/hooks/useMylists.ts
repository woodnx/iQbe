import useSWR from 'swr';
import axios from '../plugins/axios';
import { MylistInformation } from '../types';
import Sqids from 'sqids';
import dayjs from 'dayjs';
import useUserStore from '../store/user';

const fetcher = (url: string) => axios.get<MylistInformation[]>(url).then(res => res.data); 

export const useMylistInfomations = (shouldFetch = true) => {
  const userId = useUserStore.getState().userId;
  const { data: mylists, isLoading, error, mutate } = useSWR(
    shouldFetch ? '/mylists' : null, 
  fetcher);

  mylists?.forEach(async m => {
    if (!m.mid) {
      const sqids = new Sqids({ minLength: 10, alphabet: m.name });
      const now = dayjs().valueOf();
      const mid = sqids.encode([ userId, now ]);

      await axios.put('/mylists/mid', {
        mylistId: m.id,
        mid,
      });
    }
  });

  return {
    mylists,
    isLoading,
    error,
    mutate
  };
};