import { Notifications } from "@mantine/notifications"
import { BrowserRouter as Router } from "react-router-dom"
import DetermineLayout from './determineLayout.tsx'

export default function App() {
  return (
    <>
      <Notifications position="top-right" />
      <Router>
        <DetermineLayout />
      </Router>
    </>
  )
}