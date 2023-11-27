import { Notifications } from "@mantine/notifications";
import { BrowserRouter as Router } from "react-router-dom";
import Layout from './layouts';
import { ModalsProvider } from "@mantine/modals";
import ResetPasswordModal from "./components/ResetPasswordModal";

export default function App() {
  const modals = {
    requestResetPassword: ResetPasswordModal,
  };

  return (
    <>
      <Notifications position="top-right" />
      <ModalsProvider modals={modals}>
        <Router>
          <Layout />
        </Router>
      </ModalsProvider>      
    </>
  );
}