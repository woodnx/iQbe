import { components } from 'api/schema';

import { ContextModalProps } from '@mantine/modals';
import { ActionIcon, Code, CopyButton, Group, rem, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';

type Quiz = components["schemas"]["Quiz"];

export interface QuizDetailesModalInnerProps {
  quiz: Quiz,
}

export default function QuizDetailesModal({
  innerProps,
}: ContextModalProps<QuizDetailesModalInnerProps>) {
  const json = JSON.stringify(innerProps.quiz, null, 4);

  return (
    <Code
      block
      style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', }}
    > 
      <Group justify='flex-end'>
        <CopyButton value={json}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? 'Copied' : 'Copy'} position='right' withArrow>
              <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                {copied ? (
                  <IconCheck style={{ width: rem(16) }} />
                ) : (
                  <IconCopy style={{ width: rem(16) }} />
                )}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
      </Group>
      
      { json }
    </Code>
  );
}