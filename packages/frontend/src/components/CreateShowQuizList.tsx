import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Center, DefaultProps, Grid, Group, Loader, Text } from "@mantine/core";
import QuizControllBar from "@/components/QuizControllBar";
import FilteringModal from "@/components/FilteringModal";
import QuizShuffleButton from "@/components/QuizShuffleButton";
import QuizPagination from "@/components/QuizPagination";
import QuizList from "@/components/QuizList";
import { KeywordOption, QuizRequestParams, WorkbooksData } from "@/types";
import useQuizzes from "@/hooks/useQuizzes";
import MylistDeleteModal from "@/components/MylistDeleteModal";
import MylistEditModal from "@/components/MylistEditModal";
import { useInput } from "@/hooks";
import axios from "@/plugins/axios";
import { useWorkbooks } from "@/hooks/useWorkbooks";

interface Props extends DefaultProps {
  wid: string,
}

export default function({ wid }: Props) {
  const isAll = (wid == 'all');
  const navigator = useNavigate();
  const [ params, setParams ] = useState<QuizRequestParams>({ perPage: 100, workbooks: isAll ? undefined : [ wid ] });
  const [ activePage, setPage ] = useState(1);
  const { quizzes } = useQuizzes(params, `/create`);
  const { workbooks, mutate } = useWorkbooks();

  const size = !!quizzes && quizzes.length !== 0 ? quizzes[0].size : 0;
  const workbooksName = isAll ? 'すべてのクイズ' : workbooks?.find(list => list.wid == wid)?.name;

  const [ newNameProps ] = useInput(workbooksName || '');

  const toFilter = (
    workbooks?: string[], 
    levels?: string[], 
    keyword?: string, 
    keywordOption?: KeywordOption,
    perPage?: number,
  ) => {
    setPage(1)
    setParams({ 
      ...params, 
      page: 1, 
      seed: undefined,
      perPage,
      workbooks, 
      levels, 
      keyword, 
      keywordOption,
    })
  }

  const toShuffle = (
    seed: number
  ) => {
    setPage(1)
    setParams({
      ...params,
      page: 1,
      seed
    })
  }

  const changePage = (
    page: number
  ) => {
    setPage(page)
    setParams({...params, page})
  }

  const toEdit = async () => {
    const newlist = await axios.put<WorkbooksData[]>('/workbooks/rename', {
      wid,
      newName: newNameProps.value,
    }).then(res => res.data);
    mutate(newlist);
  }

  const toDelete = async () => {
    const newlist = await axios.delete<WorkbooksData[]>('/workbooks', {
      data: {
        wid
      }
    }).then(res => res.data);
    navigator('/create');
    mutate(newlist);
  }

  return (
    <>
      <QuizControllBar
        height={!!quizzes ? 190 : 140}
        total={size}
        header={
          <Card 
            m={7} 
            w="100%" 
            withBorder
            sx={(theme) => ({
              backgroundImage: theme.fn.gradient(),
              color: theme.white,
            })}
          >
            <Group position="apart">
              <Text weight={700} size={25}>{ workbooksName }</Text>
              {
                !isAll ? <Group spacing="md">
                  <MylistEditModal
                    newNameProps={newNameProps}
                    onSave={toEdit}
                  />
                  <MylistDeleteModal
                    onDelete={toDelete}
                  />
                </Group> : null
              }
            </Group>
          </Card>
        }
        buttons={
          <Group>
            <FilteringModal
              apply={toFilter}
            />
            <QuizShuffleButton
              apply={toShuffle}
            />
          </Group>
        }
        pagination={
          <Grid.Col span={12} mb="xs">
            <Center>
              <QuizPagination
                page={activePage}
                total={!!params.perPage ? Math.ceil(size / params.perPage) : 0}
                setPage={changePage}
              />
            </Center>
          </Grid.Col>
        }
      />
      {!!quizzes ? 
        quizzes.length !== 0 ? 
        <QuizList
          quizzes={quizzes}
        />
        :
        <Center>No data</Center>   
      : 
        <Center>
          <Loader variant="dots"/>
        </Center>
      }
    </>
  )
}