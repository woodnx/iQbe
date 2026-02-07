import "dayjs/locale/ja";

import { RouterProvider } from "@tanstack/react-router";

import { DatesProvider } from "@mantine/dates";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

import CategoryCreateModal from "@/features/category/components/CategoryCreateModal";
import CategoryDeleteModal from "@/features/category/components/CategoryDeleteModal";
import CategoryEditModal from "@/features/category/components/CategoryEditModal";
import FilteringContextModal from "@/features/filtering/components/FilteringContextModal";
import MylistCreateModal from "@/features/mylist/components/MylistCreateModal";
import MylistEditModal from "@/features/mylist/components/MylistEditModal";
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
};

declare module "@mantine/modals" {
  export interface MantineModalsOverride {
    modals: typeof modals;
  }
}

export default function App() {
  return (
    <ModalsProvider modals={modals}>
      <DatesProvider settings={{ locale: "ja" }}>
        <Notifications position="top-right" />
        <RouterProvider router={router} />
      </DatesProvider>
    </ModalsProvider>
  );
}
