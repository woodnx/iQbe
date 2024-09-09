import useAspidaSWR from '@aspida/swr';
import api from '@/plugins/api';
import dayjs, { Period } from '@/plugins/dayjs';

const defineLabel = (start: string, period: Period): string => {
  if (period === 'month'){
    const month = dayjs(start).format('MMM');
    return month;
  } else {
    const date = dayjs(start).date();
    const month = dayjs(start).month();
    return `${month+1}/${date}`;
  }
}

const useUserStatus = (date: string, period: Period) => {
  const { data, isLoading, error } = useAspidaSWR(api.analysis.status._date(date)._period(period));

  const userStatus = data?.map(status => {
    const label = defineLabel(status.start, period);
    const total = status.right + status.wrong + status.through;
    return {
      label,
      total,
      ...status
    }
  }).reverse();
  
  return {
    userStatus,
    isLoading,
    error
  }
}

export default useUserStatus;