import 'dayjs/locale/ja';

import { BrowserRouter as Router } from 'react-router-dom';

import { DatesProvider } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

import CategoryCreateModal from './components/CategoryCreateModal';
import CategoryDeleteModal from './components/CategoryDeleteModal';
import CategoryEditModal from './components/CategoryEditModal';
import MylistEditModal from './components/MylistEditModal';
import QuizEditModal from './components/QuizEditModal';
import Layout from './layouts';
import MylistCreateModal from './components/MylistCreateModal';
import QuizDeleteModal from './components/QuizDeleteModal';

const modals = {
  quizEdit: QuizEditModal,
  quizDelete: QuizDeleteModal,
  categoryEdit: CategoryEditModal,
  categoryCreate: CategoryCreateModal,
  categoryDelete: CategoryDeleteModal,
  mylistCreate: MylistCreateModal,
  mylistEdit: MylistEditModal,
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