import { Card, DefaultProps, Overlay, Progress, Text } from "@mantine/core";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';

interface Props extends DefaultProps {
  question: string,
  visible: boolean,
  time: number,
  count: number,
  countlimit?: number,
  timelimit?: number,
}

export default function PracticeTypewriteQuiz({
  question,
  visible,
  time,
  timelimit = 3000,
  count,
  countlimit = 5000,
}: Props) {
  const throughval = 100 - (timelimit - time) / timelimit * 100;
  const countval = 100 - (countlimit - count) / countlimit * 100;

  return (
    <>
      <Progress value={throughval} radius="xs" size="lg" bg="blue.1" striped />
      <Card p="sm" radius="sm" bg="gray.1" mih="7em">
        <Text>
          {question}
        </Text>
        {!visible && 
          <Overlay bg="gray.4" opacity={1} center>
            <div style={{ width: 100, height: 100 }}>
              <CircularProgressbar 
                value={countval} 
                text={`${Math.floor(count/1000) + 1}`} 
                strokeWidth={15}
                styles={buildStyles({
                  textSize: "30px"
                })}
              />
            </div>
          </Overlay>
        }
      </Card>
    </>
   
  );
}