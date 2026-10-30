import { useQuery } from "@tanstack/react-query";
import dayjs, { Period } from "@/plugins/dayjs";
import { readResponse, rpc } from "@/utils/client";

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
  const { data, error, isLoading } = useQuery({
    queryKey: [
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
    ],
    queryFn: ({ signal }) =>
      rpc.api.analysis.status[":date"][":period"]
        .$get(
          {
            param: {
              date,
              period,
            },
          },
          { init: { signal: signal } },
        )
        .then(readResponse),
  });

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
