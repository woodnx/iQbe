export function fetcher(url: string) { 
  const baseUrl = 'http://localhost:9000/v2'

  return fetch(`${baseUrl}${url}`).then(res => res.json())
}