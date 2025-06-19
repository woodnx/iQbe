import { useParams } from "react-router-dom";

import WorkbookSearch from "@/components/WorkbookSearch";
import WorkbookShowQuizList from "@/components/WorkbookShowQuizList";
import { $api } from "@/utils/client";

export default function Workbooks() {
  const { wid } = useParams();
  const { data: workbooks } = $api.useQuery("get", "/workbooks");

  return (
    <>
      {!wid ? (
        <WorkbookSearch workbooks={workbooks || []} />
      ) : (
        <WorkbookShowQuizList key={wid} wid={wid} />
      )}
    </>
  );
}
