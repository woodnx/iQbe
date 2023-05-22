import { useEffect, useState } from "react"
import useUserStore from "./store/user"
import { useMediaQuery } from "@mantine/hooks"

export type formInputProps = {
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