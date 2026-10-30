import { TagsInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { cleanQuery, readResponse, rpc } from "@/utils/client";

export interface TagInputProps {
  value?: string[];
  onChange?: (values: string[]) => void;
  disabled?: boolean;
}

export default function TagInput({
  value = [],
  onChange = () => {},
  disabled,
}: TagInputProps) {
  const [search, setSearch] = useState("");
  const [debounced] = useDebouncedValue(search, 500);

  const { data: searchedTags } = useQuery({
    queryKey: [
      "get",
      "/tags",
      {
        params: {
          query: {
            q: debounced,
          },
        },
      },
    ],
    queryFn: ({ signal }) =>
      rpc.api.tags
        .$get(
          {
            query: cleanQuery({
              q: debounced,
            }),
          },
          { init: { signal: signal } },
        )
        .then(readResponse),
  });

  const data = searchedTags?.map((item) => item.label);

  return (
    <TagsInput
      label="タグの編集"
      placeholder="Space/Enterで区切り文字"
      clearable
      searchValue={search}
      onSearchChange={setSearch}
      value={value}
      maxTags={10}
      data={data}
      disabled={disabled}
      onChange={(value) => {
        onChange(value);
      }}
    />
  );
}
