import { Notifications } from "@mantine/notifications";
import { BrowserRouter as Router } from "react-router-dom";
import Layout from './layouts';
import { ModalsProvider } from "@mantine/modals";
import QuizEditModal from "./components/QuizEditModal";
import { DatesProvider } from "@mantine/dates";
import 'dayjs/locale/ja';

const modals = {
  quizEdit: QuizEditModal,
};

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof modals;
  }
}

export default function App() {
  return (
    <ModalsProvider modals={modals}>
      <DatesProvider settings={{ locale: 'ja' }}>
        <Notifications position="top-right" />
        <Router>
          <Layout />
        </Router> 
      </DatesProvider>
    </ModalsProvider>
  );
}