import { useCounter } from "@mantine/hooks";
import { useCallback, useEffect, useState } from "react";
import { useInterval } from "./useInterval";

export const useTypewriter = (
  initialText: string,
  typeSpeed: number,
  onComplete = () => {},
): {
  text: string;
  set: (newtext: string) => void;
  start: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
  typing: boolean;
  pausing: boolean;
  stopping: boolean;
  done: boolean;
} => {
  const wordLength = initialText.length;
  const [text, setText] = useState("");
  const [textIdx, { increment, reset: resetCounter }] = useCounter(0, {
    min: 0,
    max: wordLength,
  });
  const [typing, setTyping] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [done, setDone] = useState(false);

  const typewriterTick = useCallback(() => {
    setText(initialText.slice(0, textIdx + 1));
    increment();

    if (textIdx + 1 >= wordLength) {
      setTyping(false);
      setDone(true);
      onComplete();
    }
  }, [initialText, textIdx, wordLength, increment, onComplete]);

  useInterval(
    typewriterTick,
    typing && textIdx < wordLength ? typeSpeed : null,
  );

  useEffect(() => {
    reset();
  }, [initialText]);

  const set = (newtext: string) => {
    setText(newtext);
  };

  const start = () => {
    if (textIdx >= wordLength) {
      reset();
    }
    setTyping(true);
    setPausing(false);
    setStopping(false);
    setDone(false);
  };

  const pause = () => {
    setTyping(false);
    setPausing(true);
    setStopping(false);
  };

  const stop = () => {
    setText(initialText);
    setTyping(false);
    setPausing(false);
    setStopping(true);
    setDone(false);
    resetCounter();
  };

  const reset = () => {
    setTyping(false);
    setPausing(false);
    setStopping(false);
    setDone(false);
    setText("");
    resetCounter();
  };

  return {
    text,
    set,
    start,
    pause,
    stop,
    reset,
    typing,
    pausing,
    stopping,
    done,
  };
};
