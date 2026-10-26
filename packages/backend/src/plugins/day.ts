import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

export type Period = "day" | "week" | "month";

// Half-open intervals in Japan time. Date parameters use the same mysql2
// serialization as history inserts; existing DATETIME values are not rewritten.
export const generateRange = (basicDate: string, period: Period) => {
  const date = /(?:Z|[+-]\d{2}:?\d{2})$/.test(basicDate)
    ? dayjs(basicDate).tz("Asia/Tokyo")
    : dayjs.tz(basicDate, "Asia/Tokyo");
  return Array.from({ length: 7 }, (_, index) => {
    const start = date.subtract(index, period).startOf(period);
    return [start.toDate(), start.add(1, period).toDate()] as const;
  });
};

export const format = (day: Date) => {
  return dayjs(day).format("YYYY-MM-DD HH:mm:ss");
};

export default dayjs;
