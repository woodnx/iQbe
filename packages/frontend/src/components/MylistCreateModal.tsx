import { $api } from "@/utils/client";
import { BoxProps } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";

import MylistEditForm from "./MylistEditForm";
import { notifications } from "@mantine/notifications";

interface MylistCreateModalInnerProps extends BoxProps {
  qid: string;
}

export default function MylistCreateModal({
  context,
  id,
  innerProps,
}: ContextModalProps<MylistCreateModalInnerProps>) {
  const { qid } = innerProps;
  const { mutate: addMylist } = $api.useMutation("post", "/mylists");
  const { mutate: addQuizToMylist } = $api.useMutation("post", "/register");

  const toCreate = async (mylistname: string) => {
    try {
      addMylist(
        {
          body: {
            listName: mylistname,
          },
        },
        {
          onSuccess: ({ mid }) => {
            addQuizToMylist({
              body: {
                qid,
                mid,
              },
            });
            notifications.show({
              title: "マイリストを新規作成しました",
              message: "マイリストを作成し、クイズを追加しました",
            });
          },
        },
      );
    } catch (e) {
      return;
    }
    context.closeModal(id);
  };
  return (
    <MylistEditForm onSave={toCreate} onClose={() => context.closeModal(id)} />
  );
}
