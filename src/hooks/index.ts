import { useEffect, useRef, useState } from "react"
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
  word: string,
  typeSpeed: number
): [
  string,
  {
    start: () => void;
    stop: () => void;
    reset: () => void;
  },
  {
    typing: boolean,
    stopping: boolean,
    done: boolean,
  }
] => {
  const wordLength = word.length;
  const [ typetext, setTypetext ] = useState('');
  const [ textIdx, { increment, reset: resetCounter } ] = useCounter(0, { min:0, max: wordLength });
  const [ intervalId, setIntervalId ] = useState<NodeJS.Timer | null>(null);
  const [ typing, setTyping ] = useState(false);
  const [ stopping, setStopping ] = useState(false);
  const [ done, setDone ] = useState(false);

  const typewriter = () => {
    setTypetext(word.slice(0, textIdx));
    increment();
    if (textIdx >= wordLength){
      if (!!intervalId) clearInterval(intervalId);
    }
  }

  const typewriterRef = useRef<() => void>(typewriter);
  
  useEffect(() => {
    typewriterRef.current = typewriter;
  }, [typewriter]);

  useEffect(() => {
    if (typing) {
      const tick = () => {typewriterRef.current()}
      const id = setInterval(tick, typeSpeed);
      setIntervalId(id);

      return () => {
        clearInterval(id);
        setIntervalId(null);
        setTyping(false);
        setStopping(false);
        setDone(true);
      };
    }
  }, [typing]);

  const start = () => {
    setTyping(true);
    setStopping(false);
    setDone(false);
  }

  const stop = () => {
    if (!!intervalId) clearInterval(intervalId);
    setTyping(false);
    setStopping(true);
    setDone(false);
  }

  const reset = () => {
    if (!!intervalId) clearInterval(intervalId);
    setTyping(false);
    setStopping(false);
    setDone(false);
    setTypetext('');
    resetCounter();
  }

  return [
    typetext,
    { 
      start,
      stop,
      reset,
    },
    {
      typing,
      stopping,
      done,
    }
  ]
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
