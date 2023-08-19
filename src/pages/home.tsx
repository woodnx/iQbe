import { Grid } from "@mantine/core";
import ActivityStatus from "../components/ActivityStatus";

export default function Home() {
  return (
    <>
      <Grid>
        <Grid.Col span={6}>
          <ActivityStatus/>
        </Grid.Col>
      </Grid>
    </>
  )
}