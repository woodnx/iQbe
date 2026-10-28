import { useCallback, useEffect, useRef, useState } from "react";
import { useInterval } from "./useInterval";
import { useTimer } from "./useTimer";
import { useTypewriter } from "./useTypewriter";

export interface formInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export type formInputReset = () => void;

export const useInput = (
  initialValue: string,
): [formInputProps, formInputReset] => {
  const [value, setValue] = useState<string>(initialValue);

  const props = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setValue(e.currentTarget.value),
  };
  const resetValue = () => setValue(initialValue);

  return [props, resetValue];
};

export { useInterval, useTimer, useTypewriter };

export const useAnimationFrame = (callback = () => {}) => {
  const reqIdRef = useRef<number | undefined>(undefined);
  
  const loop = useCallback(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    callback();
  }, [callback]);

  useEffect(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, [loop]);
};
