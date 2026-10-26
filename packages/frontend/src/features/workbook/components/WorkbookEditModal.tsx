import type { Workbook as ApiWorkbook } from "@/utils/api-types";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { BoxProps } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { useQueryClient } from "@tanstack/react-query";
import {
  ALL_WORKBOOKS_QUERY_KEY,
  QuerySnapshot,
  restoreQuerySnapshot,
  takeQuerySnapshot,
  WORKBOOKS_QUERY_KEY,
} from "@/utils/queryCache";

import WorkbookCreateForm from "./WorkbookCreateForm";

interface WorkbookEditModalInnerProps extends BoxProps {
  wid: string;
  name: string;
  date?: string;
}

type Workbook = ApiWorkbook;

export default function WorkbookEditModal({
  context,
  id,
  innerProps,
}: ContextModalProps<WorkbookEditModalInnerProps>) {
  const { wid, name, date } = innerProps;
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationKey: ["put", "/workbooks/{wid}"],
    mutationFn: api.putWorkbooksWid,
    onMutate: async ({ body, params }) => {
      await queryClient.cancelQueries({ queryKey: WORKBOOKS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: ALL_WORKBOOKS_QUERY_KEY });

      const previousWorkbooks = takeQuerySnapshot<Workbook[]>(
        queryClient,
        WORKBOOKS_QUERY_KEY,
      );
      const previousAllWorkbooks = takeQuerySnapshot<Workbook[]>(
        queryClient,
        ALL_WORKBOOKS_QUERY_KEY,
      );

      const targetWid = params.path.wid;
      const patchWorkbook = (data?: Workbook[]) => {
        if (!data) return data;
        return data.map((workbook) =>
          workbook.wid === targetWid
            ? {
                ...workbook,
                name: body.name,
                date: body.published ?? null,
              }
            : workbook,
        );
      };

      queryClient.setQueriesData<Workbook[] | undefined>(
        { queryKey: WORKBOOKS_QUERY_KEY },
        patchWorkbook,
      );
      queryClient.setQueriesData<Workbook[] | undefined>(
        { queryKey: ALL_WORKBOOKS_QUERY_KEY },
        patchWorkbook,
      );

      return { previousWorkbooks, previousAllWorkbooks };
    },
    onError: (_, __, context) => {
      const rollback = context as
        | {
            previousWorkbooks: QuerySnapshot<Workbook[]>;
            previousAllWorkbooks: QuerySnapshot<Workbook[]>;
          }
        | undefined;
      if (!rollback) return;
      restoreQuerySnapshot(queryClient, rollback.previousWorkbooks);
      restoreQuerySnapshot(queryClient, rollback.previousAllWorkbooks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WORKBOOKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALL_WORKBOOKS_QUERY_KEY });
    },
  });

  const toEdit = async (name: string, published?: Date) => {
    mutate({
      body: {
        name,
        published: published?.toISOString(),
      },
      params: {
        path: {
          wid,
        },
      },
    });
    context.closeModal(id);
  };

  return (
    <WorkbookCreateForm
      name={name}
      date={date ? new Date(date) : undefined}
      onSubmit={toEdit}
      onClose={() => context.closeModal(id)}
    />
  );
}
