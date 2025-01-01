import { useState } from "react";
import { BoxProps, CheckIcon, Combobox, Group, Pill, PillsInput, ScrollArea, useCombobox } from "@mantine/core";
import { QuizWorkbookBadge } from "./QuizWorkbookBadge";
import { useWorkbooks } from "@/hooks/useWorkbooks";

interface FilteringWorkbookProps extends BoxProps {
  value?: string[],
  onChange?: (value: string[]) => void
}

export default function FilteringWorkbook({ 
  value = [], 
  onChange = () => {},
  ...others
}: FilteringWorkbookProps ) {
  const { workbooks } = useWorkbooks(true);
  const [ search, setSearch ] = useState('');
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const handleValueSelect = (v: string) => {
    onChange([ ...value, v ]);
  }

  const handleValueRemove = (v: string) => {
    onChange(value.filter((_v) => _v !== v));
  }
  
  const options = workbooks?.filter((item) => 
    item.name.toLowerCase().includes(search.trim().toLowerCase()
  )).map((workbook) => (
    <Combobox.Option value={workbook.wid} key={workbook.wid} active={value.includes(workbook.wid)}>
      <Group gap="sm">
        {value.includes(workbook.wid) ? <CheckIcon size={12} /> : null}
        <QuizWorkbookBadge
          workbook={workbook}
        />
      </Group>
    </Combobox.Option>
  ));

  const pills = value.map((v) => (
    <Pill 
      key={v} 
      onRemove={() => handleValueRemove(v)}
      withRemoveButton
    >
      { workbooks?.filter(({ wid }) => wid == v)[0].name }
    </Pill>
  ))
  
  return (
    <Combobox 
      store={combobox}
      onOptionSubmit={handleValueSelect}
      withinPortal={false}
      {...others}
    >
      <Combobox.DropdownTarget>
        <PillsInput pointer onClick={() => combobox.openDropdown()} label="問題集による絞り込み">
          <Pill.Group>
            { pills }
            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                value={search}
                placeholder="問題集名を入力"
                onChange={(event) => {
                  combobox.updateSelectedOptionIndex();
                  setSearch(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Backspace' && search.length === 0) {
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
            {options && options?.length > 0 ? options : <Combobox.Empty>何も見つかりませんでした...😢</Combobox.Empty>}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}