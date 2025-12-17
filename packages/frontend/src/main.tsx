import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/dropzone/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { IsMobileProvider } from "./contexts/isMobile";
import { RequestResetPasswordProvider } from "./contexts/requestResetPassword";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider
      theme={{
        fontFamily:
          "Hiragino Maru Gothic Pro, Kosugi Maru, BIZ UDGothic, Roboto, HelveticaNeue, Arial, sans-serif",
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
