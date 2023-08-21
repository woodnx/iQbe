import { useCallback, useEffect, useRef, useState } from "react"
import useUserStore from "../store/user"
import { useCounter, useMediaQuery } from "@mantine/hooks"

export interface formInputProps {
  value: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export type formInputReset = () => void

export const useInput = (
  initialValue: string,
): [
  formInputProps,
  formInputReset
] => {
  const [ value, setValue ] = useState<string>(initialValue)

  const props = { 
    value, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.currentTarget.value) 
  }
  const resetValue = () => setValue(initialValue)

  return [
    props, resetValue
  ]
}

export const useIsMobile = () => {
  const matches = useMediaQuery('(min-width: 48em)');
  return !matches
}

export const useTypewriter = (
  initialText: string,
  typeSpeed: number,
  afterCallback = () => {},
): {
  text: string,
  set: (newtext: string) => void,
  start: () => void,
  pause: () => void,
  stop: () => void,
  reset: () => void,
  typing: boolean,
  pausing: boolean,
  stopping: boolean,
  done: boolean,
} => {
  const wordLength = initialText.length;
  const [ text, setText ] = useState('');
  const [ textIdx, { increment, reset: resetCounter } ] = useCounter(0, { min:0, max: wordLength });
  const [ intervalId, setIntervalId ] = useState<NodeJS.Timeout | null>(null);
  const [ typing, setTyping ] = useState(false);
  const [ pausing, setPausing ] = useState(false);
  const [ stopping, setStopping ] = useState(false);
  const [ done, setDone ] = useState(false);

  const typewriter = () => {
    setText(initialText.slice(0, textIdx));
    increment();
    if (textIdx >= wordLength){
      if (!!intervalId) clearInterval(intervalId);
      afterCallback();
    }
  }

  const typewriterRef = useRef<() => void>(typewriter);
  
  useEffect(() => {
    typewriterRef.current = typewriter;
  }, [typewriter]);

  useEffect(() => {
    if (typing) {
      const tick = () => {typewriterRef.current()};
      const id = setInterval(tick, typeSpeed);
      setIntervalId(id);

      return () => {
        clearInterval(id);
        setIntervalId(null);
        setTyping(false);
        setPausing(false);
        setStopping(false);
        setDone(true);
      };
    }
  }, [typing]);

  const set = (newtext: string) => {
    setText(newtext);
  }

  const start = () => {
    setTyping(true);
    setPausing(false);
    setStopping(false);
    setDone(false);
  }

  const pause = () => {
    if (!!intervalId) clearInterval(intervalId);
    setTyping(false);
    setPausing(true);
    setStopping(false);
    setDone(false);
  }

  const stop = () => {
    if (!!intervalId) clearInterval(intervalId);
    setText(initialText);
    setTyping(false);
    setPausing(false);
    setStopping(true);
    setDone(false);
    resetCounter();
  }

  const reset = () => {
    if (!!intervalId) clearInterval(intervalId);
    setTyping(false);
    setPausing(false);
    setStopping(false);
    setDone(false);
    setText('');
    resetCounter();
  }

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
}

export const useTimer = (
  initialTime: number,
  interval: number,
  afterCallback = () => {},
): {
  time: number,
  start: () => void,
  pause: () => void,
  stop: () => void,
  reset: () => void,
  counting: boolean,
  pausing: boolean,
  stopping: boolean,
  done: boolean,
} => {
  const [ time, setTime ] = useState(initialTime);
  const [ intervalId, setIntervalId ] = useState<NodeJS.Timeout | null>(null);
  const [ counting, setCounting ] = useState(false);
  const [ pausing, setPausing ] = useState(false);
  const [ stopping, setStopping ] = useState(false);
  const [ done, setDone ] = useState(false);

  const counter = () => {
    setTime(p => p - interval);
    if (time <= 0){
      if (!!intervalId) clearInterval(intervalId);
      afterCallback();
    }
  }

  const counterRef = useRef<() => void>(counter);

  useEffect(() => {
    counterRef.current = counter;
  }, [counter]);

  useEffect(() => {
    if (counting) {
      const tick = () => {counterRef.current()};
      const id = setInterval(tick, interval);
      setIntervalId(id);

      return () => {
        clearInterval(id);
        setIntervalId(null);
        setCounting(false);
        setPausing(false);
        setStopping(false);
        setDone(true);
      };
    }
  }, [counting]);

  const start = () => {
    setCounting(true);
    setPausing(false);
    setStopping(false);
    setDone(false);
  }

  const pause = () => {
    setCounting(false);
    setPausing(true);
    setStopping(false);
    setDone(false);
  }

  const stop = () => {
    if (!!intervalId) clearInterval(intervalId);
    setCounting(false);
    setPausing(false);
    setStopping(true);
    setDone(false);
    setTime(0);
  }

  const reset = () => {
    if (!!intervalId) clearInterval(intervalId);
    setCounting(false);
    setPausing(false);
    setStopping(false);
    setDone(false);
    setTime(initialTime);
  }

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
}

export const useAnimationFrame = (callback = () => {}) => {
  const reqIdRef = useRef<number>();

  const loop = useCallback(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    callback()
  }, [callback]);

  useEffect(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    return () => { 
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current) 
    };
  }, [loop]);
}

export const useFetch = <T>(
  url: string, 
  init?: RequestInit
) => {
  const [data, setData] = useState<T>()
  const [error, setError] = useState()
  const [loading, setLoading] = useState(true)
  const token = useUserStore((state) => state.idToken)
  const baseUrl = 'http://localhost:9000/v2'

  useEffect(() => {
    if (!url) return
    fetch(`${baseUrl}${url}`, {
      ...init,
      headers: {
        "Authorization": `${token}`
      }
    })
    .then(res => res.json())
    .then(setData)
    .then(() => setLoading(false))
    .catch(setError)
  }, [url])

  return {
    loading,
    data,
    error
  }
}
