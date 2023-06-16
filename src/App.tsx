import { Notifications } from "@mantine/notifications"
import { BrowserRouter as Router } from "react-router-dom"
import Layout from './layouts'

export default function App() {
  return (
    <>
      <Notifications position="top-right" />
      <Router>
        <Layout />
      </Router>
    </>
  )
}