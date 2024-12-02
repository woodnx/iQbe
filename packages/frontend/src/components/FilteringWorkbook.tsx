import { useState } from "react";
import { BoxProps, CheckIcon, Combobox, Group, Pill, PillsInput, ScrollArea, useCombobox } from "@mantine/core";
import { QuizWorkbookBadge } from "./QuizWorkbookBadge";
import { useWorkbooks } from "@/hooks/useWorkbooks";

interface FilteringWorkbookProps extends BoxProps {
  values: string[] | undefined,
  onChange: (values: string[]) => void
}

export default function FilteringWorkbook({ 
  values, 
  onChange,
  ...others
 }: FilteringWorkbookProps ) {
  const { workbooks } = useWorkbooks(true);
  const [ search, setSearch ] = useState('');
  const [ innerValues, setValue ] = useState<string[]>(values || []);
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const handleValueSelect = (value: string) => {
    setValue((current) => {
      const values = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      onChange(values);
      return values;
    });
  }

  const handleValueRemove = (value: string) => {
    setValue((current) => { 
      const values = current.filter((v) => v !== value);
      onChange(values);
      return values;
    });
  }
  
  const options = workbooks?.filter((item) => 
    item.name.toLowerCase().includes(search.trim().toLowerCase()
  )).map(({ wid, color }) => (
    <Combobox.Option value={wid} key={wid} active={innerValues.includes(wid)}>
      <Group gap="sm">
        {innerValues.includes(wid) ? <CheckIcon size={12} /> : null}
        <QuizWorkbookBadge
          wid={wid}
          levelColor={color || 'gray'}
        />
      </Group>
    </Combobox.Option>
  ));

  const pills = innerValues.map((value) => (
    <Pill 
      key={value} 
      onRemove={() => handleValueRemove(value)}
      withRemoveButton
    >
      { workbooks?.filter(({ wid }) => wid == value)[0].name }
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
                    handleValueRemove(innerValues[innerValues.length - 1]);
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