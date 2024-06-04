import dayjs, { extend } from 'dayjs'
import duration from 'dayjs/plugin/duration';
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import type { ManipulateType } from 'dayjs';

extend(duration);
dayjs.extend(utc)
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

export type Period = 'day' | 'week' | 'month'

export const generateRange = (basicDate: string, period: ManipulateType) => {
  const date = dayjs(basicDate)

  const ranges = Array(7).fill([]).map((_, idx) => {
    const end = date.subtract(idx, period).endOf(period).toDate()
    const start = date.subtract(idx, period).startOf(period).toDate()
    return [ start, end ]
  })
  
  return ranges
}

export const format = (day: Date) => {
  return dayjs(day).format('YYYY-MM-DD HH:mm:ss');
}

export default dayjs
