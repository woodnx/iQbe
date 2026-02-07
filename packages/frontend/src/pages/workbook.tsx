import WorkbookSearch from "@/features/workbook/components/WorkbookSearch";
import { $api } from "@/utils/client";

export default function Workbooks() {
  const { data: workbooks } = $api.useQuery("get", "/workbooks");

  return (
    <>
      <WorkbookSearch workbooks={workbooks || []} />
    </>
  );
}
