import { DefaultProps, Text } from "@mantine/core";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props extends DefaultProps {
  onFinish: () => void
}

export function PracticeQuizIntro({
  onFinish,
}: Props) {
  const reqIdRef = useRef<number>(0);
  const [ size, setSize ] = useState(0);
  const defaultSize = 6;
  const duration = 500;  // アニメーション時間（ミリ秒）
  const startTime = Date.now();

  const easeOutBack = (x: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;

    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  const animation = useCallback(() => {
    const progress = Math.min(1, (Date.now() - startTime) / duration); // 進捗率

    // 処理
    setSize(defaultSize * easeOutBack(progress));

    if (progress < 1) reqIdRef.current = requestAnimationFrame(animation);
    else {
      cancelAnimationFrame(reqIdRef.current);
      onFinish();
    }
  }, []);

  useEffect(() => {
    reqIdRef.current = requestAnimationFrame(animation);
    return () => cancelAnimationFrame(reqIdRef.current);
  }, [animation]);

  return (
    <Text fz={`${size}rem`}  c="#FFF">問題</Text>
  )
}