import { BoxProps, CheckIcon, Combobox, Group, Pill, PillsInput, ScrollArea, Text, useCombobox } from "@mantine/core";
import { components } from "api/schema";

type CategoryBase = components['schemas']['Category'] & components['schemas']['SubCategory'];

interface FilteringCategoriesBaseProps extends BoxProps {
  data?: CategoryBase[],
  values?: CategoryBase[] | undefined,
  label?: string,
  placeholder?: string,
  onAdd?: (value: CategoryBase) => void,
  onRemove?: (value: CategoryBase) => void,
  onChange?: (values: CategoryBase[]) => void
}

export default function FilteringCategoriesBase({ 
  data = [],
  values = [],
  label, 
  placeholder,
  onChange = () => {},
  onAdd = () => {},
  onRemove = () => {},
  ...others
}: FilteringCategoriesBaseProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const handleValueSelect = (value?: CategoryBase) => {
    if (!value) return;
    if (values.some(v => v.id === value.id)) return;
    onAdd(value);
    onChange([ ...values, value ]);
  }

  const handleValueRemove = (value: CategoryBase) => {
    onRemove(value);
    onChange(values.filter(v => v.id !== value.id));
  }
  
  const options = data?.map(({ id, name, description }) => (
    <Combobox.Option 
      value={String(id)} 
      key={id} 
      mb={4}
    >
      <Group justify="space-between" wrap="nowrap">
        <div>
          <Text size="sm" lineClamp={1}>{name}</Text>
          <Text size="xs" lineClamp={1} opacity={0.65}>
            {description}
          </Text>
        </div>
        {values.some((v) => v.id == id) ? <CheckIcon size={12} /> : null}
      </Group>
    </Combobox.Option>
  ));

  const pills = values.map((value) => (
    <Pill 
      key={value.id} 
      onRemove={() => handleValueRemove(value)}
      withRemoveButton
    >
      { data?.filter(({ id }) => id == value.id)[0].name }
    </Pill>
  ));
  
  return (
    <Combobox 
      store={combobox}
      onOptionSubmit={(v) => handleValueSelect(data?.find(d => d.id == Number(v)))}
      withinPortal={true}
      {...others}
    >
      <Combobox.DropdownTarget>
        <PillsInput 
          label={label}
          pointer
          onClick={() => combobox.openDropdown()}
        >
          <Pill.Group>
            { pills }
            <Combobox.EventsTarget>
              <PillsInput.Field
                type="hidden"
                placeholder={placeholder}
                onBlur={() => combobox.closeDropdown()}
                onChange={() => {
                  combobox.updateSelectedOptionIndex();
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Backspace') {
                    event.preventDefault();
                    handleValueRemove(values[values.length - 1]);
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
            {
              (options && options?.length > 0) 
              ? options 
              : <Combobox.Empty>何も見つかりませんでした...😢</Combobox.Empty>
            }
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}