import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { IsMobileProvider } from './contexts/isMobile'
import { RequestResetPasswordProvider } from './contexts/requestResetPassword';
import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider>
      <IsMobileProvider>
        <RequestResetPasswordProvider>
          <App />
        </RequestResetPasswordProvider>
      </IsMobileProvider>
    </MantineProvider>
  </React.StrictMode>,
);
