import {
  ActionIcon,
  Button,
  Center,
  CopyButton,
  Modal,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconUsersPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useIsMobile } from "@/contexts/isMobile";
import { readResponse, rpc } from "@/utils/client";

export interface InviteCodeCreateModalProps {}

export default function InviteCodeCreateModal({}: InviteCodeCreateModalProps) {
  const [opened, { open, close }] = useDisclosure();
  const [enabled, setEnabled] = useState(false);
  const { data } = useQuery({
    queryKey: ["post", "/invite-code", {}],
    queryFn: ({ signal }) =>
      rpc.api["invite-code"]
        .$post({}, { init: { signal: signal } })
        .then(readResponse),
    ...{
      enabled,
    },
  });
  const inviteCode = data?.code;
  const isMobile = useIsMobile();

  const Icon = () => <IconUsersPlus />;

  const click = () => {
    open();
    setEnabled(true);
  };

  const _close = () => {
    close();
    setEnabled(false);
  };

  const DefaultButton = () => (
    <Button leftSection={<Icon />} onClick={click}>
      招待コードの新規発行
    </Button>
  );

  const MobileButton = () => (
    <ActionIcon onClick={click}>
      <Icon />
    </ActionIcon>
  );

  return (
    <>
      <Modal
        radius="lg"
        withCloseButton={false}
        padding="xl"
        centered
        opened={opened}
        onClose={_close}
      >
        <Stack justify="center" gap="xl">
          <Center> {inviteCode} </Center>
          {inviteCode ? (
            <CopyButton value={inviteCode}>
              {({ copy }) => (
                <Button
                  size="lg"
                  radius="xl"
                  onClick={() => {
                    copy();
                    _close();
                  }}
                >
                  コードをコピーして閉じる
                </Button>
              )}
            </CopyButton>
          ) : (
            <Button size="lg" radius="xl" disabled>
              コードをコピーして閉じる
            </Button>
          )}
        </Stack>
      </Modal>
      {isMobile ? <MobileButton /> : <DefaultButton />}
    </>
  );
}
