import { DefaultProps, Grid, MantineNumberSize, SimpleGrid } from "@mantine/core";

interface Props extends DefaultProps{
  width?: MantineNumberSize,
  horizonal?: boolean,
  onlyname?: boolean,
}

export default function Logo({
  width = "md",
  horizonal = false,
  ...others
}: Props) {  
  const HorizonalLogo = (
    <Grid justify="center" align="center"  {...others}>
      <Grid.Col span={6}>
        <img src="../../iqbe.png" width={width} />
      </Grid.Col>
      <Grid.Col span={6}>
        <img src="../../iqbe-name.png" width={width} />
      </Grid.Col>
    </Grid>
  );

  const NamedLogo = (
    <SimpleGrid cols={1} >
      <img src="../../iqbe.png" width={width} />
      <img src="../../iqbe-name.png" width={width} />
    </SimpleGrid>
  );

  return (
    <>
    {horizonal ?  HorizonalLogo : NamedLogo}
    </>
  );
}