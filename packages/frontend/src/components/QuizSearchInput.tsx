import { useState } from "react";
import { useNavigate } from "react-router-dom";

import useQuizzes from "@/hooks/useQuizzes";
import { ActionIcon, TextInput, TextInputProps } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconFilter, IconSearch } from "@tabler/icons-react";
import { QuizRequestParams } from "@/types";

export default function QuizSearchInput(props: TextInputProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { params, setParams } = useQuizzes();

  return (
    <TextInput
      placeholder="クイズを検索"
      radius="xl"
      size="md"
      rightSectionWidth={42}
      leftSection={<IconSearch />}
      rightSection={
        <ActionIcon
          size={32}
          radius="xl"
          color="gray"
          variant="transparent"
          onClick={() => {
            setParams({
              ...params,
              keyword: search,
            });
          }}
        >
          <IconFilter
            onClick={() =>
              modals.openContextModal({
                modal: "quizFiltering",
                size: "lg",
                title: "絞り込み",
                innerProps: {
                  onSubmit: (v: QuizRequestParams) => {
                    setParams(v);
                    navigate("/search");
                  },
                },
              })
            }
          />
        </ActionIcon>
      }
      value={search}
      onChange={(e) => setSearch(e.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          setParams({
            ...params,
            keyword: search,
          });
          navigate("/search");
        }
      }}
      {...props}
    />
  );
}
