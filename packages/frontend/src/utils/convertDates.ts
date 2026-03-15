import dayjs from "@/plugins/dayjs";

export type DateRangeValue = [Date | null, Date | null];

export const convertDates = (dates: DateRangeValue) => {
  if (dates[1] != null) {
    return [
      dayjs(dates[0]).startOf("day").valueOf(),
      dayjs(dates[1]).endOf("day").valueOf(),
    ];
  } else {
    return [
      dayjs(dates[0]).startOf("day").valueOf(),
      dayjs(dates[0]).endOf("day").valueOf(),
    ];
  }
};
