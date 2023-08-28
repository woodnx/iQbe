import { Pagination } from "@mantine/core";
import { useIsMobile } from "../hooks";

interface QuizPaginationProps {
  page: number,
  total: number,
  setPage: (value: number) => void,
};

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
      withEdges
      size={isMobile ? 'sm' : 'md'}
    />
  );
}