import { useEffect, useState } from "react"
import useUserStore from "./store/user"

export const useInput = (
  initialValue: number | string,
): [
  {
    value: number | string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  },
  () => void,
] => {
  const [ value, setValue ] = useState<number | string>(initialValue)

  const props = { 
    value, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.currentTarget.value) 
  }
  const resetValue = () => setValue(initialValue)

  return [
    props, resetValue
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