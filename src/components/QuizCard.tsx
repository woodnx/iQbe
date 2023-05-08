import { Badge, Card, DefaultProps, Flex, Group, MantineNumberSize, Selectors, Text, } from "@mantine/core";
import QuizMylistButton from "./QuizMylistButton";
import QuizFavoriteButton from "./QuizFavoriteButton";
import useStyles, { QuizCardStylesParams } from "./QuizCard.styles";

// このtypeは，useStyleに定義されたすべてのselectorsを含む結合が存在する．
// ここではroot | title | descriptionである．
type QuizCardStylesNames = Selectors<typeof useStyles>

interface QuizCardProps extends DefaultProps<QuizCardStylesNames, QuizCardStylesParams> {
  margin?: MantineNumberSize,
  index: number,
  question: string,
  answer: string,
}

export default function QuizCard({
  classNames,
  styles,
  unstyled,
  className,
  margin,
  index = 1,
  question = "",
  answer="",
  
}: QuizCardProps) {
  const { classes, cx } = useStyles(
    { margin },
    { name: 'QuizCard', classNames, styles, unstyled }
  )

  return (
    <Card className={cx(classes.root, className)} withBorder>
      <Group position="apart">
        <Text>No.{index}</Text>
        <QuizFavoriteButton/>
      </Group>
      <Text className={classes.text}>{question}</Text>
      <Text align="right" className={classes.text}>
        {answer}
      </Text>
      <Flex
        justify="space-between"
        align="center"
      >
        <QuizMylistButton/>
        <Badge>abc2014</Badge>
      </Flex>
    </Card>
  )
}