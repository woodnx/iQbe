import { ActionIcon, TextInput, TextInputProps } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconFilter, IconSearch } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { QuizRequestParams } from "@/types";

export default function QuizSearchInput(props: TextInputProps) {
  const navigate = useNavigate({ from: "/" });
  const [search, setSearch] = useState("");

  return (
    <TextInput
      placeholder="クイズを検索"
      radius="xl"
      size="md"
      rightSectionWidth={42}
      leftSection={<IconSearch />}
      rightSection={
        <ActionIcon size={32} radius="xl" color="gray" variant="transparent">
          <IconFilter
            onClick={() =>
              modals.openContextModal({
                modal: "quizFiltering",
                size: "lg",
                title: "絞り込み",
                innerProps: {
                  onSubmit: (v: QuizRequestParams) => {
                    navigate({
                      to: "/search",
                      search: {
                        ...v,
                        page: 1,
                      },
                    });
                  },
                },
              })
            }
          />
        </ActionIcon>
      }
      value={search || ""}
      onChange={(e) => setSearch(e.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          navigate({
            to: "/search",
            search: {
              keyword: search,
              page: 1,
              maxView: 100,
            },
          });
        }
      }}
      {...props}
    />
  );
}
