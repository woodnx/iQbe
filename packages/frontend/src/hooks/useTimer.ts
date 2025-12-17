import { useCallback, useEffect, useState } from "react";
import { useInterval } from "./useInterval";

export const useTimer = (
  initialTime: number,
  interval: number,
  afterCallback = () => {},
): {
  time: number;
  start: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
  counting: boolean;
  pausing: boolean;
  stopping: boolean;
  done: boolean;
} => {
  const [time, setTime] = useState(initialTime);
  const [counting, setCounting] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [done, setDone] = useState(false);

  const counterTick = useCallback(() => {
    setTime((prevTime) => {
      const newTime = prevTime - interval;
      if (newTime <= 0) {
        setCounting(false);
        setDone(false);
        afterCallback();
        return 0;
      }
      return newTime;
    });
  }, [counting, afterCallback]);

  useInterval(counterTick, counting && time > 0 ? interval : null);

  useEffect(() => {
    reset();
  }, [initialTime]);

  const start = () => {
    if (time <= 0 && initialTime > 0) {
      reset();
    }
    setCounting(true);
    setPausing(false);
    setStopping(false);
    setDone(false);
  };

  const pause = () => {
    setCounting(false);
    setPausing(true);
    setStopping(false);
  };

  const stop = () => {
    setCounting(false);
    setPausing(false);
    setStopping(true);
    setDone(false);
    setTime(0);
  };

  const reset = () => {
    setCounting(false);
    setPausing(false);
    setStopping(false);
    setDone(false);
    setTime(initialTime);
  };

  return {
    time,
    start,
    pause,
    stop,
    reset,
    counting,
    pausing,
    stopping,
    done,
  };
};
