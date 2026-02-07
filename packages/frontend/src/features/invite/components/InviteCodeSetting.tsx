import { $api } from "@/utils/client";
import {
  ComboboxItem,
  Group,
  Paper,
  ScrollArea,
  Select,
  Text,
  Title,
} from "@mantine/core";

import InviteCodeCreateModal from "./InviteCodeCreateModal";
import { useState } from "react";

export interface InviteCodeSettingProps {}

export default function InviteCodeSetting() {
  const [status, setStatus] = useState<ComboboxItem>();
  const [sort, setSort] = useState<ComboboxItem>();
  console.log(status, sort);
  const { data: inviteCodes } = $api.useQuery("get", "/invite-code", {
    params: {
      query: {
        status: status && Number(status.value),
        sort: sort?.value,
      },
    },
  });

  const contents = inviteCodes?.map((inviteCode) => (
    <Paper bg="gray.1" mb="sm" p="sm">
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
          onChange={(_value, option) => setStatus(option)}
        />
        <Select
          label="ソート"
          data={[
            { value: "asc", label: "作成日時（昇順）" },
            { value: "desc", label: "作成日時（降順）" },
          ]}
          value={sort?.value}
          onChange={(_value, option) => setSort(option)}
        />
      </Group>
      <ScrollArea h={250}>{contents}</ScrollArea>
    </>
  );
}
