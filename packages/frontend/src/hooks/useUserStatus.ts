import dayjs, { Period } from "@/plugins/dayjs";
import { $api } from "@/utils/client";

const defineLabel = (start: string, period: Period): string => {
  if (period === "month") {
    const month = dayjs(start).format("MMM");
    return month;
  } else {
    const date = dayjs(start).date();
    const month = dayjs(start).month();
    return `${month + 1}/${date}`;
  }
};

const useUserStatus = (date: string, period: Period) => {
  const { data, error, isLoading } = $api.useQuery(
    "get",
    "/analysis/status/{date}/{period}",
    {
      params: {
        path: {
          date,
          period,
        },
      },
    },
  );

  const userStatus = data
    ?.map((status) => {
      const label = defineLabel(status.start, period);
      const total = status.right + status.wrong + status.through;
      return {
        label,
        total,
        ...status,
      };
    })
    .reverse();

  return {
    userStatus,
    isLoading,
    error,
  };
};

export default useUserStatus;
