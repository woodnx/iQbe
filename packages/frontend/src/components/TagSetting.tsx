import { Collapse, Group, Title } from "@mantine/core"
import TagCard from "./TagCard"
import TagCreateButton from "./TagCreateButton"
import { useDisclosure } from "@mantine/hooks"
import TagCreateCard from "./TagCreateCard"
import { randomSwatch } from "@/utils/tagColorSwatches"
import { $api } from "@/utils/client"
import { useQueryClient } from "@tanstack/react-query"

const randomColor = randomSwatch();

export default function TagSetting() {
  const [ opened, { toggle }] = useDisclosure();
  const { data: tags } = $api.useQuery('get', '/tags');
  const { mutate, variables, isPending } = $api.useMutation('post', '/tags');
  const queryClient = useQueryClient();

  return (
    <>
      <Group justify="space-between" my="sm">
        <Title order={4}>タグの編集</Title>
        <TagCreateButton
          onClick={toggle}
        />
      </Group>
      <Collapse in={opened}>
        <TagCreateCard 
          defaultColor={randomColor}
          onCancel={toggle}
          onCreate={(label, description, color) => {
            mutate(
              { body: {
                label,
                description,
                color,
              }},
              {
                onSettled: async () => {
                  return await queryClient.invalidateQueries({ 
                    queryKey: ['get', '/tags'],
                  });
                }
              }
            );

            toggle();
          }}
        />
      </Collapse>
      {
        tags?.map(tag => (
          <TagCard 
            mt="xs"
            tid={tag.tid}
            label={tag.label}
            description={tag.description || ''}
            color={tag.color || '#868e96'}
            key={tag.tid}
          />
        ))
      }
      {
        isPending && <TagCard 
          mt="xs"
          tid=""
          label={variables.body.label}
          description={variables.body.description || ''}
          color={variables.body.color || '#868e96'}
        />
      }
    </>
  )
}