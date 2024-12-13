import { $api } from "@/utils/client";
import { TagsInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useState } from "react";

export interface TagInputProps {
  value?: string[],
  onChange?: (values: string[]) => void,
}

export default function TagInput({
  value = [],
  onChange = () => {},
}: TagInputProps) {
  const [ search, setSearch ] = useState('');
  const [ debounced ] = useDebouncedValue(search, 500);

  const { data: searchedTags } = $api.useQuery('get', '/tags', {
    params: {
      query: {
        q: debounced,
      }
    }
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
      onChange={(value) => {
        onChange(value)
      }}
    />
  );
}