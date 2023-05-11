import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications';
import DetermineLayout from './determineLayout.tsx'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider>
      <Notifications position="top-right"/>
      <Router>
        <DetermineLayout />
      </Router>
    </MantineProvider>
  </React.StrictMode>,
)
