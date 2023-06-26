import { Badge, Card, DefaultProps, Flex, Group, MantineNumberSize, Selectors, Text, } from "@mantine/core";
import QuizMylistButton from "./QuizMylistButton";
import QuizFavoriteButton from "./QuizFavoriteButton";
import useStyles, { QuizCardStylesParams } from "./styles/QuizCard.styles";

export interface Quiz {
  id: number,
  question: string,
  answer: string,
  workbook: string,
  level: string,
  date: string,
}

// このtypeは，useStyleに定義されたすべてのselectorsを含む結合が存在する．
// ここではroot | title | descriptionである．
type QuizCardStylesNames = Selectors<typeof useStyles>

interface QuizCardProps extends DefaultProps<QuizCardStylesNames, QuizCardStylesParams> {
  margin?: MantineNumberSize,
  index: number,
  quiz: Quiz,
}

export default function QuizCard({
  classNames,
  styles,
  unstyled,
  className,
  margin,
  index,
  quiz,
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
      <Text className={classes.text}>{quiz.question}</Text>
      <Text align="right" className={classes.text}>
        {quiz.answer}
      </Text>
      <Flex
        justify="space-between"
        align="center"
      >
        <QuizMylistButton/>
        <Badge 
          color={quiz.level}
          radius="sm"
        >
          {quiz.workbook}({quiz.date.slice(0, 4)})
        </Badge>
      </Flex>
    </Card>
  )
}