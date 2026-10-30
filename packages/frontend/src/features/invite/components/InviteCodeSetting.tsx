import { cleanQuery, readResponse, rpc } from "@/utils/client";
import {
  ComboboxItem,
  Group,
  Paper,
  ScrollArea,
  Select,
  Text,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import InviteCodeCreateModal from "./InviteCodeCreateModal";

export interface InviteCodeSettingProps {}

export default function InviteCodeSetting() {
  const [status, setStatus] = useState<ComboboxItem>();
  const [sort, setSort] = useState<ComboboxItem>();
  console.log(status, sort);
  const { data: inviteCodes } = useQuery({
    queryKey: [
      "get",
      "/invite-code",
      {
        params: {
          query: {
            status: status && Number(status.value),
            sort: sort?.value,
          },
        },
      },
    ],
    queryFn: ({ signal }) =>
      rpc.api["invite-code"]
        .$get(
          {
            query: cleanQuery({
              status: status && Number(status.value),
              sort: sort?.value,
            }),
          },
          { init: { signal: signal } },
        )
        .then(readResponse),
  });

  const contents = inviteCodes?.map((inviteCode, i) => (
    <Paper bg="gray.1" mb="sm" p="sm" key={i}>
      <Group justify="space-between">
        {inviteCode.code}
        {inviteCode.status == 0 ? (
          <Text fz="sm" c="blue">
            未使用
          </Text>
        ) : (
          <Text fz="sm">使用済み</Text>
        )}
      </Group>
    </Paper>
  ));

  return (
    <>
      <Group justify="space-between">
        <Title order={3} my="md">
          招待コードの発行
        </Title>
        <InviteCodeCreateModal />
      </Group>
      <Group grow mb="sm">
        <Select
          label="状態"
          data={[
            { value: "0", label: "未使用" },
            { value: "1", label: "使用済み" },
          ]}
          value={status?.value}
          onChange={(_value, option) => setStatus(option ?? undefined)}
        />
        <Select
          label="ソート"
          data={[
            { value: "asc", label: "作成日時（昇順）" },
            { value: "desc", label: "作成日時（降順）" },
          ]}
          value={sort?.value}
          onChange={(_value, option) => setSort(option ?? undefined)}
        />
      </Group>
      <ScrollArea h={250}>{contents}</ScrollArea>
    </>
  );
}
