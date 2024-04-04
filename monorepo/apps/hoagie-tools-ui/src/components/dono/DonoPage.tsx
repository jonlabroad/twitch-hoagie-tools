import { PageHeader } from "../PageHeader";

import { useSaveLastPath } from "../../hooks/LastPathHooks";

import "../../styles/Dono.scss";
import { DonoContextProvider } from "./DonoContextProvider";
import { DonoPageContainer } from "./DonoPageContainer";
import { useStreamerName } from "../../hooks/useStreamerName";
import { SSLEventProvider } from "../context/SSLEventProvider";

export interface DonoPageProps {}

export const DonoPage = (props: DonoPageProps) => {
  useSaveLastPath();
  useStreamerName();

  return (
    <>
        <DonoContextProvider>
          <SSLEventProvider>
            <DonoPageContainer />
          </SSLEventProvider>
        </DonoContextProvider>
    </>
  );
};
