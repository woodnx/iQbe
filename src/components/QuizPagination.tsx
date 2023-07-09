import { Pagination } from "@mantine/core";

interface QuizPaginationProps {
  page: number,
  total: number,
  setPage: (value: number) => void,
}

export default function QuizPagination({ page, setPage, total}: QuizPaginationProps) {
  return (
    <Pagination 
      total={total}
      value={page} 
      onChange={setPage}
    />
  )
}