import { Button } from '@mantine/core'
import QuizCardList from '../components/QuizCardList'
import { getAuth, signOut } from 'firebase/auth'

export default function Home() {
  const auth = getAuth()
  return (
    <>
      <Button onClick={() => signOut(auth)}>Logout</Button>
      <QuizCardList/>
    </>
  )
}