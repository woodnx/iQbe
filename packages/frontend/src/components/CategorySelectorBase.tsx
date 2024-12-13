import { CloseButton, Combobox, Input, InputBase, ScrollArea, Text, useCombobox } from "@mantine/core";
import type { components } from 'api/schema';

type Category = components["schemas"]["Category"];

interface CategorySelectorBaseProps {
  data: Category[] | undefined,
  value?: number,
  label?: string,
  placeholder?: string,
  onChange?: (value: number | undefined) => void,
  onClear?: () => void,
}

export default function CategorySelectorBase({
  data,
  value,
  label,
  placeholder,
  onChange = () => {},
  onClear = () => {},
}: CategorySelectorBaseProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const options = data?.map(({ id, name, description }) => (
    <Combobox.Option value={String(id)} key={id} bg={value == id ? 'blue.1' : undefined}>
      <Text size="sm">{name}</Text>
      <Text size="xs" opacity={0.65}>
        {description}
      </Text>
    </Combobox.Option>
  ));

  const display = data?.filter(({ id }) => value == id)[0]?.name;

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        onChange(Number(val));
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          label={label}
          component="button"
          type="button"
          pointer
          rightSection={
            value != null ? (
              <CloseButton
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { 
                  onChange(undefined);
                  onClear();
                }}
                aria-label="Clear value"
              />
            ) : (
              <Combobox.Chevron/>
            )
          }
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents={value == null ? 'none' : 'all'}
        >
          { 
            display 
            ? <Text lineClamp={1} fz="sm">
                { display }
              </Text> 
            : <Input.Placeholder>
                <Text lineClamp={1} fz="sm">
                  {placeholder || 'ジャンルを選択'}
                </Text> 
              </Input.Placeholder>
          }
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          <ScrollArea.Autosize type="scroll" mah={200}>
            {options}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}