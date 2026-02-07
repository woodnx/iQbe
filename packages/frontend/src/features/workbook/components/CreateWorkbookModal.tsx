import { ActionIcon, Button, Group, Modal, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSquarePlus2 } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { components } from "api/schema";
import { useRef, useState } from "react";
import { useIsMobile } from "@/contexts/isMobile";
import { $api } from "@/utils/client";
import {
  ALL_WORKBOOKS_QUERY_KEY,
  QuerySnapshot,
  restoreQuerySnapshot,
  takeQuerySnapshot,
  WORKBOOKS_QUERY_KEY,
} from "@/utils/queryCache";

type Workbook = components["schemas"]["Workbook"];

export default function CreateWorkbookModal() {
  const [listName, setListName] = useState("");
  const [opened, { open, close }] = useDisclosure();
  const queryClient = useQueryClient();
  const previousWorkbooksRef = useRef<QuerySnapshot<Workbook[]>>([]);
  const previousAllWorkbooksRef = useRef<QuerySnapshot<Workbook[]>>([]);
  const tempWidRef = useRef<string | null>(null);
  const { mutate } = $api.useMutation("post", "/workbooks", {
    onMutate: async ({ body }) => {
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
      previousWorkbooksRef.current = previousWorkbooks;
      previousAllWorkbooksRef.current = previousAllWorkbooks;

      const tempWid = `tmp-${Date.now()}`;
      tempWidRef.current = tempWid;
      const optimisticWorkbook: Workbook = {
        wid: tempWid,
        name: body.name,
        date: body.published ?? null,
        creatorId: "",
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
      queryClient.invalidateQueries({ queryKey: ALL_WORKBOOKS_QUERY_KEY });
    },
  });
  const isMobile = useIsMobile();

  const Icon = () => <IconSquarePlus2 />;
  const ResponsiveButton = () =>
    isMobile ? (
      <ActionIcon onClick={open} variant="light" color="primary">
        <Icon />
      </ActionIcon>
    ) : (
      <Button leftSection={<Icon />} onClick={open}>
        New Quiz List
      </Button>
    );

  const create = async () => {
    const body = {
      name: listName,
    };

    mutate({ body });
    close();
  };

  return (
    <>
      <ResponsiveButton />
      <Modal
        opened={opened}
        onClose={close}
        title="Create New Quiz List"
        centered
      >
        <TextInput
          value={listName}
          onChange={(e) => setListName(e.currentTarget.value)}
          placeholder="New List Name"
        />
        <Group justify="right" mt="md">
          <Button onClick={() => create()}>Create</Button>
        </Group>
      </Modal>
    </>
  );
}
