import { components } from 'api/schema';

import { Stack, TextInput } from '@mantine/core';

import WorkbookCard from './WorkbookCard';
import { useState } from 'react';

interface WorkbookSearchProps {
  workbooks: components["schemas"]["Workbook"][]
}

export default function WorkbookSearch({
  workbooks
}: WorkbookSearchProps) {
  const [ search, setSearch ] = useState('');
  const displayed = workbooks.filter((workbook) => 
    workbook.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <>
      <TextInput 
        mb="lg"
        variant='filled'
        placeholder='問題集の名前を検索'
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
      />
      <Stack>
        {
          displayed.map(workbook => (
            <WorkbookCard
              key={workbook.wid}
              wid={workbook.wid}
              title={workbook.name}
            />
          ))
        }
      </Stack>
    </>
  )
}