import { Card, Grid, Tabs } from "@mantine/core";
import ActivityStatus from "../components/ActivityStatus";
import ActivityUserRanking from "../components/ActivityUserRanking";

export default function Home() {
  return (
    <>
      <Grid>
        <Grid.Col span={12} md={6}>
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
                <Tabs.Tab value="status">STATUS</Tabs.Tab>
                <Tabs.Tab value="ranking">RANKING</Tabs.Tab>
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
        <Grid.Col span={12} md={6}>
          
        </Grid.Col>
      </Grid>
    </>
  )
}