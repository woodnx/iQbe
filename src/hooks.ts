import React, { useState } from "react"

export function fetcher(url: string) { 
  const baseUrl = 'http://localhost:9000/v2'

  return fetch(`${baseUrl}${url}`).then(res => res.json())
}

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