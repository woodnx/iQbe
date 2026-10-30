import { useIsMobile } from "@/contexts/isMobile";
import { Pagination } from "@mantine/core";

interface QuizPaginationProps {
  page: number;
  total: number;
  setPage: (value: number) => void;
}

export default function QuizPagination({
  page,
  setPage,
  total,
}: QuizPaginationProps) {
  const isMobile = useIsMobile();
  return (
    <Pagination
      total={total}
      value={page}
      onChange={setPage}
      color="dark"
      withEdges
      size={isMobile ? "sm" : "md"}
    />
  );
}
