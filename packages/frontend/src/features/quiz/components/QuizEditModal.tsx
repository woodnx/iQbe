import { ContextModalProps } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { components, paths } from "api/schema";
import { $api } from "@/utils/client";

import QuizEditForm from "./QuizEditForm";

type QuizEditSubmitValues =
  paths["/quizzes"]["post"]["requestBody"]["content"]["application/json"];
type Category = components["schemas"]["Category"];

interface Props {
  qid: string;
  question: string;
  answer: string;
  wid?: string;
  category?: Category[];
  tags?: string[];
}

export default function ({
  context,
  id,
  innerProps,
}: ContextModalProps<Props>) {
  const { qid, ...formProps } = innerProps;
  const { mutate } = $api.useMutation("put", "/quizzes/{qid}");
  const submit = async ({
    question,
    answer,
    tags,
    category,
    wid,
  }: QuizEditSubmitValues) => {
    mutate(
      {
        body: {
          question,
          answer,
          category,
          tags,
          wid,
        },
        params: { path: { qid } },
      },
      {
        onSuccess: () => {
          notifications.show({
            title: "クイズを編集しました",
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
    context.closeModal(id);
  };

  return (
    <>
      <QuizEditForm {...formProps} onSubmit={(v) => submit(v)} />
    </>
  );
}
