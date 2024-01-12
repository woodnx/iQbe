import { Button, Center, Modal, ModalProps, Space, Stack, Title } from "@mantine/core";
import { useIsMobile } from "@/contexts/isMobile";

interface Props extends ModalProps {
  rightTotal: number,
  quizzesTotal: number,
  isTransfer: boolean,
  canNext: boolean,
  onRetry?: () => void,
  onNext?: () => void,
  onTry?: () => void,
  onQuit?: () => void,
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
  isTransfer,
  canNext,
  onClose,
  onNext = () => {},
  onRetry = () => {},
  onTry = () => {},
  onQuit = () => {},
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
      {...others}
    >
      <Center>
        <Title>{ message }</Title>
      </Center>
      <Space h="md"/>
      <Stack
        spacing="md"
        h={300}
      >
        <Button
          size="lg"
          color="blue.9"
          onClick={() => {
            onRetry();
            onClose();
          }}
        >同じ問題群でやりなおす</Button>
        <Button
          size="lg"
          color="blue.4"
          disabled={isTransfer || !canNext}
          onClick={() => {
            onNext();
          }}
        >次の{quizzesTotal}問をする</Button>
        <Button
          size="lg"
          color="orange"
          disabled={isTransfer}
          onClick={() => {
            onTry();
            onClose();
          }}
        >絞り込みをやり直す</Button>
        <Button
          size="lg"
          variant="outline"
          color="red"
          onClick={() => {
            onQuit();
            onClose();
          }}
        >クイズをやめる</Button>
      </Stack>
    </Modal>
  )
}