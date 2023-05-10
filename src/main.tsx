import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import DetermineLayout from './determineLayout.tsx'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider>
      <Router>
        <DetermineLayout />
      </Router>
    </MantineProvider>
  </React.StrictMode>,
)
