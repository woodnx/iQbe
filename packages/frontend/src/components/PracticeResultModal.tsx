import { Button, Center, Modal, ModalProps, Space, Stack, Title } from "@mantine/core";
import { useIsMobile } from "../contexts/isMobile";

interface Props extends ModalProps {
  rightTotal: number,
  quizzesTotal: number,
  onRetry: () => void,
  onTry: () => void,
  onQuit: () => void,
}

const defineMessage = (rate: number) => {
  if (rate == 0) return "Don't worry!!";
  else if (rate < 0.5) return 'Nice!';
  else if (rate < 0.8) return 'Grate!';
  else if (rate < 1.0) return 'Excellent!!';
  else return 'Perfect!!!';
}

export default function PracticeResultModal({
  rightTotal,
  quizzesTotal,
  opened,
  onClose,
  onRetry,
  onTry,
  onQuit,
  ...others
}: Props) {
  const isMobile = useIsMobile();
  const rate = rightTotal / quizzesTotal;
  const message = defineMessage(rate);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      closeOnClickOutside={false}
      size={isMobile ? 'xs' : 'md'}
      pos="absolute"
      left="-5%"
      {...others}
    >
      <Center>
        <Title>{ message }</Title>
      </Center>
      <Space h="md"/>
      <Stack
        spacing="md"
        h={300}
        sx={(theme) => ({ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] })}
      >
        <Button
          size="lg"
          color="blue.9"
          onClick={() => {
            onRetry();
            onClose();
          }}
        >やりなおす</Button>
        <Button
          size="lg"
          color="blue.4"
          onClick={() => {
            onTry();
            onClose();
          }}>違う問題をする</Button>
        {/* <Button size="lg" color="green">Searchに戻る</Button> */}
        <Button
          size="lg"
          variant="outline"
          color="red"
          onClick={() => {
            onQuit();
            onClose();
          }}>クイズをやめる</Button>
      </Stack>
    </Modal>
  )
}