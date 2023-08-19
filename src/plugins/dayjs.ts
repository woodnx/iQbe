import dayjs, { extend } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import ja from 'dayjs/locale/ja';
import type { ManipulateType } from 'dayjs';

extend(duration);
dayjs.locale(ja);

export type Period = 'day' | 'week' | 'month';

export function generateRange(basicDate: string, period: ManipulateType){
  const date = dayjs(basicDate);

  const ranges: string[][] = Array(7).fill([]).map((_, idx) => {
    const end: string = date.subtract(idx, period).endOf(period).format('YYYY-MM-DD HH:mm:ss');
    const start: string = date.subtract(idx, period).startOf(period).format('YYYY-MM-DD HH:mm:ss');
    return [ start, end ];
  });

  return ranges;
}

export default dayjs;