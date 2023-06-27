import { Center, Grid, Header, Text } from "@mantine/core";
import FilteringModal from "./FilteringModal";
import QuizPagination from "./QuizPagination";
import useQuizzesStore from "../store/quiz";

export default function QuizControllBar() {
  const quizzes = useQuizzesStore(state => state.quizzes)
  const total = !!quizzes ? quizzes[0].size : 0
  return (
    <Header
      height={!!quizzes ? 105 : 60}
      fixed
    >
      <Grid px={10} pt={10}>
        <Grid.Col span={10}>
          <FilteringModal/>
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