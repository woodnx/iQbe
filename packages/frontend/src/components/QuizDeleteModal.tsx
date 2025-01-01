import { $api } from '@/utils/client';
import { Button, Group, Text } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';

export interface QuizDeleteModalInnerProps {
  qid: string,
}

const QuizDeleteModal = ({
  id,
  context,
  innerProps,
}: ContextModalProps<QuizDeleteModalInnerProps>) => {
  const { qid } = innerProps;
  const { mutate } = $api.useMutation('delete', '/quizzes/{qid}');
  const icon = <IconTrash/>;

  const submit = () => {
    mutate(
      {
        params: {
          path: {
            qid,
          }
        }
      },
      { 
        onSettled() {
          context.closeModal(id);
        },
        onSuccess: () => {
          notifications.show({
            title: 'クイズを削除しました',
            message: '',
          });
        },
        onError: () => {
          notifications.show({
            title: '何らかの障害が発生しました',
            message: '何度も続く場合はサポート担当に問い合わせてください',
            color: 'red',
          });
        }
      }
    );
  }

  return (
    <>
      <Text>クイズを削除しますか？</Text>
      <Text c="red" size="sm">※この変更は元に戻せません。</Text>
      <Group justify="space-between" mt="sm">
        <Button
          variant="outline"
          color="gray"
          onClick={close}
        >キャンセル</Button>
        <Button 
          color="red"
          onClick={submit}
          leftSection={icon}
        >削除</Button>
      </Group>
    </>
  )
}

export default QuizDeleteModal;