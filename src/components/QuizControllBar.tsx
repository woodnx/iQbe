import { Center, Grid, Header, Text } from "@mantine/core";
import QuizPagination from "./QuizPagination";
import useQuizzesStore from "../store/quiz";
import { ReactNode } from "react";

interface QuizControllBarProps {
  height: number,
  contents: ReactNode
}

export default function QuizControllBar({ height, contents }: QuizControllBarProps) {
  const quizzes = useQuizzesStore(state => state.quizzes)
  const total = !!quizzes ? quizzes[0].size : 0
  return (
    <Header
      height={height}
      fixed
    >
      <Grid px={10} pt={10}>
        <Grid.Col span={10}>
          { contents }
        </Grid.Col>
        <Grid.Col md={2}>
          <Text ta="right">総問題数: {total}</Text>
        </Grid.Col>
        <Grid.Col span={12}>
          <Center>
            <QuizPagination/>
          </Center>
        </Grid.Col>
      </Grid>
    </Header>
  )
}