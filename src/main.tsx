import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import Root from './root.tsx'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider>
      <Router>
        <Root />
      </Router>
    </MantineProvider>
  </React.StrictMode>,
)
