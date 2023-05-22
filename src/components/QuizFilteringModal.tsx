import { Button, Group, Modal } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useState } from "react"
import FilteringWorkbook from "./FilteringWorkbook"
import FilteringLevel from "./FilteringLevel"
import { useInput, useIsMobile } from "../hooks"
import FilteringWord from "./FilteringWord"
import { IconFilter, IconSearch } from "@tabler/icons-react"

export type Level = {
  id: number,
  name: string,
  color: string,
}

export default function QuizFilteringModal() {
  const [ opened, { open, close } ] = useDisclosure(true)
  const [ selectedWorkbook, setSelectedWorkbook ] = useState<string[]>([])
  const [ selectedLevel, setSelectedLevel ] = useState<string[]>([])
  const [ wordProps ] = useInput('')
  const [ wordOption, setWordOption ] = useState('0')
  const isMobile = useIsMobile()

  return (
    <>
      <Modal 
        opened={opened} 
        onClose={close} 
        title="Filtering Quiz"
        size="lg"
        fullScreen={isMobile}
      >
        <FilteringWorkbook
          value={selectedWorkbook} 
          onChange={setSelectedWorkbook}
        />
        <FilteringLevel 
          value={selectedLevel}
          onChange={setSelectedLevel}
          mt="lg"
        />
        <FilteringWord 
          wordInputProps={wordProps} 
          wordSearchOption={{ 
            value: wordOption, 
            onChange: setWordOption 
          }}
          mt="lg"
        />
        <Group mt="xl" position="right">
          <Button 
            leftIcon={<IconSearch/>}
          >Search</Button>
        </Group>
      </Modal>
      <Button 
        onClick={open}
        leftIcon={<IconFilter/>}
        variant="outline"
        color="orange"
      >Filtering</Button>
    </>
  )
}