import { Dispatch, FC, ReactNode, SetStateAction, createContext, useContext, useState } from "react";

type Props = {
	children: ReactNode;
};

const requestResetPasswordContext = createContext<boolean>(false);
const setRequestResetPasswordContext = createContext<Dispatch<SetStateAction<boolean>>>(
  () => undefined
);

const RequestResetPasswordProvider: FC<Props> = ({ children }) => {
  const [ requestingResetPassword, setRequestingResetPassword ] = useState(false);

  return (
    <requestResetPasswordContext.Provider value={requestingResetPassword}>
      <setRequestResetPasswordContext.Provider value={setRequestingResetPassword}>
        { children }
      </setRequestResetPasswordContext.Provider>
    </requestResetPasswordContext.Provider>
  )
}

const useRequestResetPassword = () => useContext(requestResetPasswordContext);
const useSetRequestResetPassword = () => useContext(setRequestResetPasswordContext);

export {
  RequestResetPasswordProvider,
  useRequestResetPassword,
  useSetRequestResetPassword,
}
