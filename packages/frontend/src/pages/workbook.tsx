import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import WorkbookSearch from "@/features/workbook/components/WorkbookSearch";

export default function Workbooks() {
  const { data: workbooks } = useQuery({
    queryKey: ["get", "/workbooks"],
    queryFn: ({ signal }) => api.getWorkbooks({}, signal),
  });

  return (
    <>
      <WorkbookSearch workbooks={workbooks || []} />
    </>
  );
}
