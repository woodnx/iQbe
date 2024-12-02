import { Card, Grid, Modal, Tabs } from "@mantine/core";
import ActivityStatus from "@/components/ActivityStatus";
import ActivityUserRanking from "@/components/ActivityUserRanking";
import { useRequestResetPassword, useSetRequestResetPassword } from "@/contexts/requestResetPassword";
import ResetPasswordModal from "@/components/ResetPasswordModal";

export default function Home() {
  const requesting = useRequestResetPassword();
  const setRequesting = useSetRequestResetPassword();

  return (
    <>
      <Modal opened={requesting} onClose={() => setRequesting(false)} >
        <ResetPasswordModal onSubmit={() => setRequesting(false)} />
      </Modal>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card
            style={{
              borderRadius: '20px 20px 0 0'
            }}
            withBorder
            p={0}
          >
            <Tabs 
              defaultValue="status"
            >
              <Tabs.List grow>
                <Tabs.Tab value="status">演習状況</Tabs.Tab>
                <Tabs.Tab value="ranking">ランキング</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="status">
                <ActivityStatus/>
              </Tabs.Panel>
              <Tabs.Panel value="ranking">
                <ActivityUserRanking/>
              </Tabs.Panel>
            </Tabs>
          </Card>
         
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          
        </Grid.Col>
      </Grid>
    </>
  )
}