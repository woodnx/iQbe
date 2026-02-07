import { useState } from "react";

import { $api } from "@/utils/client";
import {
  Badge,
  BoxProps,
  CheckIcon,
  Combobox,
  Group,
  Pill,
  PillsInput,
  rem,
  ScrollArea,
  useCombobox,
} from "@mantine/core";
import { IconTag } from "@tabler/icons-react";

interface FilteringTagsProps extends BoxProps {
  value?: string[] | undefined;
  onAdd?: (value: string) => void;
  onRemove?: (value: string) => void;
  onChange?: (values: string[]) => void;
}

export default function FilteringTags({
  value = [],
  onChange = () => {},
  onAdd = () => {},
  onRemove = () => {},
  ...others
}: FilteringTagsProps) {
  const [search, setSearch] = useState("");
  const { data: tags } = $api.useQuery("get", "/tags", {
    params: {
      query: {
        q: search,
      },
    },
  });

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const handleValueSelect = (v?: string) => {
    if (!v) return;

    onAdd(v);
    onChange([...value, v]);
    setSearch("");
  };

  const handleValueRemove = (v: string) => {
    onRemove(v);
    onChange(value.filter((_v) => _v !== v));
  };

  const options = tags?.map(({ label }) => (
    <Combobox.Option value={label} key={label} mb={4}>
      <Group>
        <Badge
          color="gray"
          radius="sm"
          variant="light"
          leftSection={<IconTag style={{ width: rem(12), height: rem(12) }} />}
        >
          {label}
        </Badge>
        {value.some((v) => v == label) ? <CheckIcon size={12} /> : null}
      </Group>
    </Combobox.Option>
  ));

  const pills = value.map((v) => (
    <Pill key={v} onRemove={() => handleValueRemove(v)} withRemoveButton>
      {v}
    </Pill>
  ));

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={handleValueSelect}
      withinPortal={true}
      {...others}
    >
      <Combobox.DropdownTarget>
        <PillsInput
          label="タグによる絞り込み"
          pointer
          onClick={() => combobox.openDropdown()}
        >
          <Pill.Group>
            {pills}
            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                value={search}
                placeholder="タグ名を入力"
                onChange={(event) => {
                  combobox.updateSelectedOptionIndex();
                  setSearch(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && search.length === 0) {
                    event.preventDefault();
                    handleValueRemove(value[value.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options>
          <ScrollArea.Autosize type="scroll" mah={200}>
            {options && options?.length > 0 ? (
              options
            ) : (
              <Combobox.Empty>何も見つかりませんでした...😢</Combobox.Empty>
            )}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
