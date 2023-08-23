import { useNavigate, useParams } from "react-router-dom"
import QuizControllBar from "../components/QuizControllBar";
import FilteringModal from "../components/FilteringModal";
import QuizShuffleButton from "../components/QuizShuffleButton";
import { Card, Center, Grid, Group, Loader, Text } from "@mantine/core";
import QuizPagination from "../components/QuizPagination";
import QuizList from "../components/QuizList";
import { KeywordOption, MylistInformation, QuizRequestParams } from "../types";
import { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import useQuizzes from "../hooks/useQuizzes";
import { useMylistInfomations } from "../hooks/useMylists";
import MylistDeleteModal from "../components/MylistDeleteModal";
import MylistEditModal from "../components/MylistEditModal";
import { useInput } from "../hooks";
import axios from "../plugins/axios";

export default function Mylist(){
  const pageParams = useParams();
  const navigator = useNavigate();
  const mylistId = pageParams.mylistId;
  const [ params, setParams ] = useState<QuizRequestParams>({ perPage: 100, mylistId: mylistId });
  const [ activePage, setPage ] = useState(1);
  const [ opened, { open, close } ] = useDisclosure(false);
  const { quizzes } = useQuizzes(params, `/mylist`);
  const { mylists, mutate } = useMylistInfomations();

  const size = !!quizzes && quizzes.length !== 0 ? quizzes[0].size : 0;
  const mylistName = mylists?.find(list => list.id == Number(mylistId))?.name;

  const [ newNameProps ] = useInput(mylistName || '');

  useEffect(() => {
    setParams({
      ...params,
      mylistId
    })
  }, [mylistId]);

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
    close();
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
    const newlist = await axios.put<MylistInformation[]>('/mylists/rename', {
      mylistId,
      newName: newNameProps.value,
    }).then(res => res.data);
    console.log(newlist)
    mutate(newlist);
  }

  const toDelete = async () => {
    const newlist = await axios.delete<MylistInformation[]>('/mylists/list', {
      data: {
        mylistId
      }
    }).then(res => res.data);
    navigator('/');
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
              <Text weight={700} size={25}>{ mylistName }</Text>
              <div>
                <MylistEditModal
                  newNameProps={newNameProps}
                  onSave={toEdit}
                  styles={(theme) => ({
                    button: {
                      marginRight: theme.spacing.xs
                    }
                  })}
                />
                <MylistDeleteModal
                  onDelete={toDelete}
                />
              </div>
            </Group>
          </Card>
        }
        buttons={
          <>
            <FilteringModal
              apply={toFilter}
              opened={opened}
              onOpen={open}
              onClose={close}
            />
            <QuizShuffleButton
              apply={toShuffle}
              ml="xs"
            />
          </>
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