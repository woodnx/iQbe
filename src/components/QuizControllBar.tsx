import { Center, Grid, Header, Text } from "@mantine/core";
import { ReactNode } from "react";

interface QuizControllBarProps {
  height: number,
  total: number,
  buttons: ReactNode,
  pagination: ReactNode,
}

export default function QuizControllBar({ 
  height, 
  total, 
  buttons, 
  pagination 
}: QuizControllBarProps) {
  return (
    <Header
      height={height}
      fixed
    >
      <Grid px={10} pt={10}>
        <Grid.Col span={10}>
          { buttons }
        </Grid.Col>
        <Grid.Col md={2}>
          <Text ta="right">総問題数: {total}</Text>
        </Grid.Col>
        <Grid.Col span={12}>
          <Center>
            { pagination }
          </Center>
        </Grid.Col>
      </Grid>
    </Header>
  )
}