import { BoxProps, Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { useRef } from "react";
import type { Workbook as ApiWorkbook } from "@/utils/api-types";
import { readResponse, rpc } from "@/utils/client";
import {
  ALL_WORKBOOKS_QUERY_KEY,
  QuerySnapshot,
  restoreQuerySnapshot,
  takeQuerySnapshot,
  WORKBOOKS_QUERY_KEY,
} from "@/utils/queryCache";
import WorkbookCreateForm from "./WorkbookCreateForm";

type Workbook = ApiWorkbook;

interface Props extends BoxProps {}

export default function WorkbookCreateModalButton({}: Props) {
  const [creating, create] = useDisclosure(false);
  const queryClient = useQueryClient();
  const previousWorkbooksRef = useRef<QuerySnapshot<Workbook[]>>([]);
  const previousAllWorkbooksRef = useRef<QuerySnapshot<Workbook[]>>([]);
  const tempWidRef = useRef<string | null>(null);
  const { mutateAsync } = useMutation({
    mutationKey: ["post", "/workbooks"],
    mutationFn: (input: InferRequestType<typeof rpc.api.workbooks.$post>) =>
      rpc.api.workbooks.$post(input).then(readResponse),
    onMutate: async ({ json: body }) => {
      const tempWid = `tmp-${Date.now()}`;
      tempWidRef.current = tempWid;

      await queryClient.cancelQueries({ queryKey: WORKBOOKS_QUERY_KEY });
      await queryClient.cancelQueries({
        queryKey: ALL_WORKBOOKS_QUERY_KEY,
      });

      const previousWorkbooks = takeQuerySnapshot<Workbook[]>(
        queryClient,
        WORKBOOKS_QUERY_KEY,
      );
      const previousAllWorkbooks = takeQuerySnapshot<Workbook[]>(
        queryClient,
        ALL_WORKBOOKS_QUERY_KEY,
      );
      previousWorkbooksRef.current = previousWorkbooks;
      previousAllWorkbooksRef.current = previousAllWorkbooks;

      const optimisticWorkbook: Workbook = {
        wid: tempWid,
        name: body.name,
        date: body.published ?? null,
        creatorId: "",
        total: 0,
        corrects: 0,
        wrongs: 0,
        ignored: 0,
      };

      previousWorkbooks.forEach(([key, data]) => {
        queryClient.setQueryData<Workbook[] | undefined>(
          key,
          data ? [...data, optimisticWorkbook] : data,
        );
      });
      previousAllWorkbooks.forEach(([key, data]) => {
        queryClient.setQueryData<Workbook[] | undefined>(
          key,
          data ? [...data, optimisticWorkbook] : data,
        );
      });
    },
    onSuccess: (createdWorkbook) => {
      const tempWid = tempWidRef.current;
      if (!tempWid) return;

      const replaceTempWorkbook = (data?: Workbook[]) => {
        if (!data) return data;
        return data.map((workbook) =>
          workbook.wid === tempWid ? createdWorkbook : workbook,
        );
      };

      queryClient.setQueriesData<Workbook[] | undefined>(
        { queryKey: WORKBOOKS_QUERY_KEY },
        replaceTempWorkbook,
      );
      queryClient.setQueriesData<Workbook[] | undefined>(
        { queryKey: ALL_WORKBOOKS_QUERY_KEY },
        replaceTempWorkbook,
      );
    },
    onError: () => {
      restoreQuerySnapshot(queryClient, previousWorkbooksRef.current);
      restoreQuerySnapshot(queryClient, previousAllWorkbooksRef.current);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WORKBOOKS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ALL_WORKBOOKS_QUERY_KEY,
      });
    },
  });

  const createWorkbook = async (name: string, published?: Date) => {
    try {
      await mutateAsync({
        json: {
          name,
          published: published?.toISOString(),
        },
      });
    } catch (e) {
      return;
    }
    create.close();
  };

  return (
    <>
      <Modal
        centered
        title="問題集の新規作成"
        zIndex={100}
        opened={creating}
        onClose={create.close}
      >
        <WorkbookCreateForm onSubmit={createWorkbook} onClose={create.close} />
      </Modal>
      <Button
        variant="outline"
        leftSection={<IconPlus />}
        onClick={create.open}
      >
        問題集の新規作成
      </Button>
    </>
  );
}
