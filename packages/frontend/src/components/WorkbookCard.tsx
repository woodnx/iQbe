import { Badge, Card, BoxProps, Grid, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";

interface Props extends BoxProps {
  wid: string,
  title: string,
  date?: string,
}

export default function WorkbookCard({
  wid,
  title,
  date,
}: Props) {
  const navigate = useNavigate();

  return (
    <Card
      px="lg"
      py="sm"
      radius="lg"
      component="a" 
      withBorder
      href=""
      onClick={(e) => {
        e.preventDefault();
        navigate(`/workbook/${wid}`);
      }}
    >
      <Grid my={10} justify="space-between">
        {
          !!date ?
          <>
            <Grid.Col span={{ base: 8, sm: 7 }} >
              <Text fw={700} truncate>{title}</Text>
            </Grid.Col>
            <Grid.Col span="content">
              <Badge>{date}</Badge>
            </Grid.Col>
          </>
          :
          <Grid.Col span={12} >
            <Text fw={700} truncate>{title}</Text>
          </Grid.Col>
        }
      </Grid>
    </Card>
  )
}