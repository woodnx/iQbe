import { useNavigate } from "react-router-dom"
import { auth } from "../plugins/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { Button, Center, Grid, Paper, PasswordInput, TextInput } from "@mantine/core"
import { useInput } from "../hooks"

export default function Login() {
  const [ passwordProps, resetPassword ] = useInput('')
  const [ emailProps, resetEmail ] = useInput('')
  const navigate = useNavigate()

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, String(emailProps.value), String(passwordProps.value))
    .then(async (_userCredential) => {
      navigate('/')
    })

    resetPassword()
    resetEmail()
  };

  return (
    <Paper shadow="md" p="35px" radius="lg">
      <Grid>
        <Grid.Col span={4}>
          <Center>
            <img src="../../iqbe-named.png" width={160}></img>
          </Center> 
        </Grid.Col>
        <Grid.Col span={8}>
          
          <form onSubmit={submit}>
            
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
              mt="sm"
            />
            <Button 
              fullWidth 
              type="submit" 
              mt="lg"
            >
              Login
            </Button>
          </form>
        </Grid.Col>
      </Grid>
    </Paper>
  )
}