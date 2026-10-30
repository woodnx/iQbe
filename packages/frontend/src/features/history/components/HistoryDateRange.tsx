import { ActionIcon, BoxProps, Popover, UnstyledButton } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import dayjs from "@/plugins/dayjs";
import { convertDates, type DateRangeValue } from "@/utils/convertDates";

interface Props extends BoxProps {
  dates: string[];
  onChangeDates: (dates: string[]) => void;
}

export default function HistoryDateRange({
  dates: stringDates,
  onChangeDates,
}: Props) {
  const dayjsDates = stringDates.map((d) => dayjs(d));
  const dates = dayjsDates.map((d) => d.toDate()) as DateRangeValue;

  const [innerDates, setInnerDates] = useState<DateRangeValue>(dates);
  const formatDates = dayjsDates?.map((date) => date.format("YYYY/MM/DD"));
  const showDate =
    dayjsDates[1].diff(dayjsDates[0], "day", true) >= 1
      ? `${formatDates[0]} ～ ${formatDates[1]}`
      : `${formatDates[0]}`;

  const nextDate = (isAhead: boolean) => {
    const range = dayjsDates[1].diff(dayjsDates[0], "day", false) + 1;
    if (isAhead)
      return dayjsDates.map((date) =>
        date.add(range, "day").toDate(),
      ) as DateRangeValue;
    else
      return dayjsDates.map((date) =>
        date.subtract(range, "day").toDate(),
      ) as DateRangeValue;
  };

  const setDates = (dates: DateRangeValue) => {
    setInnerDates(dates);
    if (dates[0] != null) onChangeDates(convertDates(dates));
  };

  return (
    <>
      <ActionIcon
        variant="subtle"
        color="gray"
        onClick={() => setDates(nextDate(false))}
      >
        <IconChevronLeft />
      </ActionIcon>
      <Popover>
        <Popover.Target>
          <UnstyledButton>{showDate}</UnstyledButton>
        </Popover.Target>
        <Popover.Dropdown>
          <DatePicker
            type="range"
            allowSingleDateInRange
            monthLabelFormat="YYYY年 M月"
            value={innerDates}
            onChange={setDates}
          />
        </Popover.Dropdown>
      </Popover>
      <ActionIcon
        variant="subtle"
        color="gray"
        onClick={() => setDates(nextDate(true))}
      >
        <IconChevronRight />
      </ActionIcon>
    </>
  );
}
