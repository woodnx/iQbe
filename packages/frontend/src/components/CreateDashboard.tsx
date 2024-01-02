import QuizEditForm from "@/components/QuizEditForm";
import CreateWorkbookModal from "@/components/CreateWorkbookModal";
import WorkbookCard from "@/components/WorkbookCard";
import { useIsMobile } from "@/contexts/isMobile";
import { Divider, Grid, Group, Title } from "@mantine/core";
import { useWorkbooks } from "@/hooks/useWorkbooks";
import axios from "@/plugins/axios";
import { SubmitValue } from "@/types";

export default function CreateDashboard() {
  const isMobile = useIsMobile();
  const { workbooks } = useWorkbooks(true);

  const submit = ({ question, answer, category, subCategory, workbook, isPublic }: SubmitValue) => {
    axios.post('quizzes', {
      question,
      answer,
      category,
      subCategory,
      workbook,
      visible: isPublic ? 1 : 0,
    });
  }

  return (
    <>
      <QuizEditForm mb={16} onSubmit={submit}/>
      <Divider/>
      <Group position="apart" my="lg">
        <Title fz={isMobile ? 25 : 35}>Editable Quiz List</Title>
        <CreateWorkbookModal/>
      </Group>
      <Grid>
        <Grid.Col sm={6} lg={3}>
          <WorkbookCard title="すべてのクイズ" wid="all"/>
        </Grid.Col>
        {
          workbooks?.map(w => (
            <Grid.Col sm={6} lg={3} key={w.wid}>
              <WorkbookCard title={w.name} wid={w.wid}/>
            </Grid.Col>
          ))
        }
      </Grid>
    </>
  )
}