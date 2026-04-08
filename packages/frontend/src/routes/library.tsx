import {
  Accordion,
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconBook2, IconList, IconStar } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LibraryItem } from "@/features/library/components/LibraryItem";
import { $api } from "@/utils/client";

export const Route = createFileRoute("/library")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: workbooks } = $api.useQuery("get", "/workbooks");
  const { data: mylists } = $api.useQuery("get", "/mylists");
  const [search, setSearch] = useState("");
  const displayedWorkbooks = (workbooks || []).filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase().trim()),
  );
  const displayedMylists = (mylists || []).filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase().trim()),
  );
  const navigate = useNavigate();

  return (
    <>
      {displayedWorkbooks?.length > 0 ? (
        <>
          <TextInput
            mb="lg"
            radius="md"
            bd="unset"
            placeholder="問題集・マイリストの名前を検索"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
          <Group mb="xs" ml="sm">
            <IconBook2 />
            <Title size="h3">問題集</Title>
          </Group>
          <Card radius="lg" p="xs">
            <Accordion variant="filled">
              {displayedWorkbooks?.map((workbook) => (
                <Accordion.Item key={workbook.wid} value={workbook.wid}>
                  <Accordion.Control display="flex">
                    <LibraryItem
                      name={workbook.name}
                      total={workbook.total}
                      corrects={workbook.corrects}
                      wrongs={workbook.wrongs}
                      ignored={workbook.ignored}
                    />
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Group grow>
                      <Button
                        radius="md"
                        variant="filled"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate({
                            to: "/workbook/$wid",
                            params: { wid: `${workbook.wid}` },
                          });
                        }}
                      >
                        問題を閲覧
                      </Button>
                      <Button
                        radius="md"
                        variant="filled"
                        color="green"
                        onClick={() =>
                          modals.openContextModal({
                            modal: "practiceSetting",
                            title: "演習の設定",
                            innerProps: {
                              onTrain: (judgements) => {
                                const seed = Math.floor(Math.random() * 100000);
                                navigate({
                                  to: "/practice",
                                  search: () => ({
                                    page: 1,
                                    seed,
                                    maxView: 100,
                                    wid: workbook.wid,
                                    judgements: judgements,
                                    isTransfer: true,
                                  }),
                                });
                              },
                            },
                          })
                        }
                      >
                        演習を開始
                      </Button>
                    </Group>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Card>
        </>
      ) : (
        <Stack mt="md" mb="3rem">
          <Text ta="center">問題集がありませんか？</Text>
          <Button onClick={() => navigate({ to: "/create" })}>
            問題を追加する
          </Button>
        </Stack>
      )}

      {displayedMylists?.length > 0 && (
        <>
          <Group align="center" mt="lg" mb="xs" ml="sm">
            <IconList />
            <Title size="h3">マイリスト</Title>
          </Group>
          <Card radius="lg" p="xs">
            <Accordion variant="filled">
              {displayedMylists?.map((mylist) => (
                <Accordion.Item key={mylist.mid} value={mylist.mid}>
                  <Accordion.Control display="flex">
                    <LibraryItem
                      name={mylist.name}
                      total={mylist.total}
                      corrects={mylist.corrects}
                      wrongs={mylist.wrongs}
                      ignored={mylist.ignored}
                    />
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Group grow>
                      <Button
                        radius="md"
                        variant="filled"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate({
                            to: "/mylist/$mid",
                            params: { mid: `${mylist.mid}` },
                          });
                        }}
                      >
                        問題を閲覧
                      </Button>
                      <Button
                        radius="md"
                        variant="filled"
                        color="green"
                        onClick={() =>
                          modals.openContextModal({
                            modal: "practiceSetting",
                            title: "演習の設定",
                            innerProps: {
                              onTrain: (judgements) => {
                                const seed = Math.floor(Math.random() * 100000);
                                navigate({
                                  to: "/practice",
                                  search: () => ({
                                    page: 1,
                                    seed,
                                    maxView: 100,
                                    judgements: judgements,
                                    mid: mylist.mid,
                                    isTransfer: true,
                                  }),
                                });
                              },
                            },
                          })
                        }
                      >
                        演習を開始
                      </Button>
                    </Group>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Card>
        </>
      )}

      <Card
        radius="lg"
        mt="lg"
        onClick={(e) => {
          e.preventDefault();
          navigate({
            to: "/favorite",
          });
        }}
        style={{
          cursor: "pointer",
        }}
        component="a"
      >
        <Group>
          <IconStar />
          <Title size="h3">お気に入り</Title>
        </Group>
      </Card>
    </>
  );
}
