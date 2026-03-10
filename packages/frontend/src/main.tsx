import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/dropzone/styles.css";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { IsMobileProvider } from "./contexts/isMobile";
import { RequestResetPasswordProvider } from "./contexts/requestResetPassword";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider
      theme={{
        fontFamily:
          "Hiragino Kaku Gothic ProN, BIZ UDPGothic, Roboto, HelveticaNeue, Arial, sans-serif",
      }}
    >
      <QueryClientProvider client={queryClient}>
        <IsMobileProvider>
          <RequestResetPasswordProvider>
            <App />
          </RequestResetPasswordProvider>
        </IsMobileProvider>
      </QueryClientProvider>
    </MantineProvider>
  </React.StrictMode>,
);
