import { useMediaQuery } from "@mantine/hooks";
import { FC, ReactNode, createContext, useContext } from "react";

type Props = {
  children: ReactNode;
};

const isMobileContext = createContext<boolean>(false);

const IsMobileProvider: FC<Props> = ({ children }) => {
  const isMobile = !useMediaQuery("(min-width: 48em)", true);

  return (
    <isMobileContext.Provider value={isMobile}>
      {children}
    </isMobileContext.Provider>
  );
};

const useIsMobile = () => useContext(isMobileContext);

export { IsMobileProvider, useIsMobile };
