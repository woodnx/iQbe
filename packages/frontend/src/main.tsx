import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { IsMobileProvider } from './contexts/isMobile'
import App from './App.tsx';
import { RequestResetPasswordProvider } from './contexts/requestResetPassword';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider withNormalizeCSS withGlobalStyles>
      <IsMobileProvider>
        <RequestResetPasswordProvider>
          <App />
        </RequestResetPasswordProvider>
      </IsMobileProvider>
    </MantineProvider>
  </React.StrictMode>,
);
