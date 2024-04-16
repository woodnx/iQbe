import dayjs from 'dayjs'
import 'dayjs/locale/ja'
import type { Dayjs, ManipulateType } from 'dayjs'

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
