import { useNavigate } from "react-router-dom"
// import { auth } from "../firebase"
// import { signInWithEmailAndPassword } from "firebase/auth"
import { Paper, PasswordInput, TextInput } from "@mantine/core"
import { useInput } from "../hooks"

export default function Login() {
  const [ passwordProps ] = useInput('')
  const [ emailProps ] = useInput('')
  // const navigate = useNavigate()

  // signInWithEmailAndPassword(auth, email, password)
  // .then((userCredential) => {
  //   const user = userCredential.user
  //   console.log(user)
    
  //   navigate('/')
  // })

  return (
    <>
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
      </Paper>
    </>
  )
}