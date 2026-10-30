import { useQuery } from "@tanstack/react-query";
import WorkbookSearch from "@/features/workbook/components/WorkbookSearch";
import { readResponse, rpc } from "@/utils/client";

export default function Workbooks() {
  const { data: workbooks } = useQuery({
    queryKey: ["get", "/workbooks"],
    queryFn: ({ signal }) =>
      rpc.api.workbooks
        .$get({}, { init: { signal: signal } })
        .then(readResponse),
  });

  return (
    <>
      <WorkbookSearch workbooks={workbooks || []} />
    </>
  );
}
