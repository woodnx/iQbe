import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/dropzone/styles.css";
import "dayjs/locale/ja";

import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import { IsMobileProvider } from "@/contexts/isMobile";
import { RequestResetPasswordProvider } from "@/contexts/requestResetPassword";

import CategoryCreateModal from "@/features/category/components/CategoryCreateModal";
import CategoryDeleteModal from "@/features/category/components/CategoryDeleteModal";
import CategoryEditModal from "@/features/category/components/CategoryEditModal";
import FilteringContextModal from "@/features/filtering/components/FilteringContextModal";
import MylistCreateModal from "@/features/mylist/components/MylistCreateModal";
import MylistEditModal from "@/features/mylist/components/MylistEditModal";
import { PracticeSettingModal } from "@/features/practice/components/PracticeSettingModal";
import QuizDeleteModal from "@/features/quiz/components/QuizDeleteModal";
import QuizDetailesModal from "@/features/quiz/components/QuizDetailesModal";
import QuizEditModal from "@/features/quiz/components/QuizEditModal";
import WorkbookDeleteModal from "@/features/workbook/components/WorkbookDeleteModal";
import WorkbookEditModal from "@/features/workbook/components/WorkbookEditModal";

import { router } from "./router";

const modals = {
  quizFiltering: FilteringContextModal,
  quizDetailes: QuizDetailesModal,
  quizEdit: QuizEditModal,
  quizDelete: QuizDeleteModal,
  categoryEdit: CategoryEditModal,
  categoryCreate: CategoryCreateModal,
  categoryDelete: CategoryDeleteModal,
  mylistCreate: MylistCreateModal,
  mylistEdit: MylistEditModal,
  workbookEdit: WorkbookEditModal,
  workbookDelete: WorkbookDeleteModal,
  practiceSetting: PracticeSettingModal,
};

declare module "@mantine/modals" {
  export interface MantineModalsOverride {
    modals: typeof modals;
  }
}

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
            <ModalsProvider modals={modals}>
              <DatesProvider
                settings={{ locale: "ja", firstDayOfWeek: 0, timezone: "JST" }}
              >
                <Notifications position="top-right" />
                <RouterProvider router={router} />
              </DatesProvider>
            </ModalsProvider>
          </RequestResetPasswordProvider>
        </IsMobileProvider>
      </QueryClientProvider>
    </MantineProvider>
  </React.StrictMode>,
);
