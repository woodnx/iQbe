import { useParams } from "@tanstack/react-router";

import WorkbookShowQuizList from "@/components/WorkbookShowQuizList";

export default function WorkbookDetail() {
  const { wid } = useParams({
    from: "/workbook/$wid",
  });

  return <WorkbookShowQuizList key={wid} wid={wid} />;
}
