import { PageHeader } from "../PageHeader";

import { useSaveLastPath } from "../../hooks/LastPathHooks";

import "../../styles/Dono.scss";
import { useParams } from "react-router";
import Config from "../../Config";
import { StateContextProvider } from "../context/StateContextProvider";
import { DonoContextProvider } from "./DonoContextProvider";
import { DonoPageContainer } from "./DonoPageContainer";
import { useStreamerName } from "../../hooks/useStreamerName";

export interface DonoPageProps {}

export const DonoPage = (props: DonoPageProps) => {
  useSaveLastPath();
  useStreamerName();

  return (
    <>
      <DonoContextProvider>
        <DonoPageContainer />
      </DonoContextProvider>
    </>
  );
};
