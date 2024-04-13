import { createContext, useContext } from "react";
import { useSaveLastPath } from "../../hooks/LastPathHooks";

import "../../styles/Dono.scss";
import { useDonoData } from "../../hooks/donoDataHooks";
import { useStreamHistory } from "../../hooks/streamHistoryHooks";
import { useStreamSelection } from "../../hooks/useStreamSelection";
import {
  StateContext,
} from "../context/StateContextProvider";
import { DonoStateContextType, defaultDonoState } from "../../state/DonoState";

export const DonoContext = createContext<DonoStateContextType>({
    dispatch: undefined,
    state: defaultDonoState,
    selection: {
      streamHistory: [],
      currentStreams: [],
      isFirst: false,
      isLast: false,
      getNextStream: () => {
        throw new Error("getNextStream not defined");
      },
    },
    refreshDonos: () => {
      throw new Error("refreshDonos not defined");
    },
  });

export const DonoContextProvider = (props: { children: any }) => {
  const { state } = useContext(StateContext);

  const [streamHistory] = useStreamHistory(state);
  const [currentStreams, getNextStream, isFirst, isLast] = useStreamSelection(
    streamHistory
  );
  const [donoState, donoDispatch, refreshDonos] = useDonoData(
    currentStreams
  );

  useSaveLastPath();

  return (
    <>
      <DonoContext.Provider
        value={{
          dispatch: donoDispatch,
          state: donoState,
          refreshDonos: refreshDonos,
          selection: {
            streamHistory: streamHistory ?? [],
            currentStreams,
            isFirst,
            isLast,
            getNextStream
          }

        }}
      >
        {props.children}
      </DonoContext.Provider>
    </>
  );
};
