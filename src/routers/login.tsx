import { useNavigate } from "react-router-dom"
import { auth } from "../firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { Button, Paper, PasswordInput, TextInput } from "@mantine/core"
import { useInput } from "../hooks"
import { useAtom } from "jotai"
import { fireBaseUserAtom } from "../atoms"

export default function Login() {
  const [ passwordProps, resetPassword ] = useInput('')
  const [ emailProps, resetEmail ] = useInput('')
  const navigate = useNavigate()
  const [ , setFirebaseUser ] = useAtom(fireBaseUserAtom)

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, String(emailProps.value), String(passwordProps.value))
    .then((userCredential) => {
      const user = userCredential.user
      setFirebaseUser(user)
      navigate('/')
    })

    resetPassword()
    resetEmail()
  };

  return (
    <>
    <form onSubmit={submit}>
      <Paper shadow="xs" p="md">
        <TextInput 
          {...emailProps}
          placeholder="Your Email"
          label="Email"
          radius="xl"
          size="md"
        />
        <PasswordInput
          {...passwordProps}
          placeholder="Your Password"
          label="Password"
          radius="xl"
          size="md"
        />
        <Button fullWidth type="submit">
          Login
        </Button>
      </Paper>
    </form>
    </>
  )
}