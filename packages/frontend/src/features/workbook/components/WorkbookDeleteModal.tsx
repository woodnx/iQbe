import { Button, Group, Text } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { components } from "api/schema";
import { $api } from "@/utils/client";
import {
  ALL_WORKBOOKS_QUERY_KEY,
  QuerySnapshot,
  restoreQuerySnapshot,
  takeQuerySnapshot,
  WORKBOOKS_QUERY_KEY,
} from "@/utils/queryCache";

type Workbook = components["schemas"]["Workbook"];

export interface WorkbookDeleteModalInnerProps {
  wid: string;
}

const WorkbookDeleteModal = ({
  id,
  context,
  innerProps,
}: ContextModalProps<WorkbookDeleteModalInnerProps>) => {
  const { wid } = innerProps;
  const queryClient = useQueryClient();
  const { mutate } = $api.useMutation("delete", "/workbooks/{wid}", {
    onMutate: async ({ params }) => {
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
      const removeWorkbook = (data?: Workbook[]) => {
        if (!data) return data;
        return data.filter((workbook) => workbook.wid !== targetWid);
      };

      queryClient.setQueriesData<Workbook[] | undefined>(
        { queryKey: WORKBOOKS_QUERY_KEY },
        removeWorkbook,
      );
      queryClient.setQueriesData<Workbook[] | undefined>(
        { queryKey: ALL_WORKBOOKS_QUERY_KEY },
        removeWorkbook,
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
  const icon = <IconTrash />;

  const submit = () => {
    mutate(
      {
        params: {
          path: {
            wid,
          },
        },
      },
      {
        onSettled() {
          context.closeModal(id);
        },
        onSuccess: () => {
          notifications.show({
            title: "問題集を削除しました",
            message: "",
          });
        },
        onError: () => {
          notifications.show({
            title: "何らかの障害が発生しました",
            message: "何度も続く場合はサポート担当に問い合わせてください",
            color: "red",
          });
        },
      },
    );
  };

  return (
    <>
      <Text>問題集を削除しますか？</Text>
      <Text c="red" size="sm">
        ※この変更は元に戻せません。
      </Text>
      <Group justify="space-between" mt="sm">
        <Button variant="outline" color="gray" onClick={close}>
          キャンセル
        </Button>
        <Button color="red" onClick={submit} leftSection={icon}>
          削除
        </Button>
      </Group>
    </>
  );
};

export default WorkbookDeleteModal;
