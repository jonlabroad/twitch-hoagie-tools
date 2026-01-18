import { PageHeader } from "../PageHeader";

import { useSaveLastPath } from "../../hooks/LastPathHooks";

import "../../styles/Dono.scss";
import { DonoContextProvider } from "./DonoContextProvider";
import { DonoPageContainer } from "./DonoPageContainer";
import { useStreamerName } from "../../hooks/useStreamerName";
import { SSLEventProvider } from "../context/SSLEventProvider";
import { StateContext } from "../context/StateContextProvider";
import { useContext } from "react";
import { SubathonPageContainer } from "../subathon/SubathonPageContainer";

export interface DonoPageProps {}

export const DonoPage = (props: DonoPageProps) => {
  useSaveLastPath();
  useStreamerName();

  const stateContext = useContext(StateContext);
  const isSubathon = stateContext.state.streamer?.toLowerCase() === "thesongery";

  return (
    <>
        <DonoContextProvider>
          <SSLEventProvider>
            {!isSubathon && <DonoPageContainer />}
            {isSubathon && <SubathonPageContainer />}
          </SSLEventProvider>
        </DonoContextProvider>
    </>
  );
};
