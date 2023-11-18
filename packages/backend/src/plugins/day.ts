import dayjs, { extend } from 'dayjs'
import duration from 'dayjs/plugin/duration'
import 'dayjs/locale/ja'
import type { ManipulateType } from 'dayjs'

extend(duration)
dayjs.locale('ja')

type Period = 'day' | 'week' | 'month'

function generateRange(basicDate: string, period: ManipulateType){
  const date = dayjs(basicDate)

  const ranges = Array(7).fill([]).map((_, idx) => {
    const end = date.subtract(idx, period).endOf(period).toDate()
    const start = date.subtract(idx, period).startOf(period).toDate()
    return [ start, end ]
  })
  
  return ranges
}

export default dayjs

export {
  generateRange,
  Period
}