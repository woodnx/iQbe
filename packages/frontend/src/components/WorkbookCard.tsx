import { Badge, Card, DefaultProps, Divider, Grid, Paper, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";

interface Props extends DefaultProps {
  wid: string,
  title: string,
  color?: string,
  date?: string,
}

export default function WorkbookCard({
  wid,
  title,
  color = '#ffffff',
  date,
}: Props) {
  const navigate = useNavigate();

  return (
    <Card<'a'>
      padding="lg" 
      radius="md"
      component="a" 
      withBorder
      href={`/create/${wid}`}
      onClick={(e) => {
        e.preventDefault();
        navigate(`/create/${wid}`);
      }}
    >
      <Card.Section >
        <Paper bg={color} h={150}/>
        <Divider/>
      </Card.Section>
      <Grid my={10} justify="space-between">
        <Grid.Col span={8} sm={7}>
          <Text weight={700} truncate>{title}</Text>
        </Grid.Col>
        <Grid.Col span="content">
          {
          !!date 
          ? <Badge>{date}</Badge>
          : null
          }
        </Grid.Col>
      </Grid>
    </Card>
  )
}