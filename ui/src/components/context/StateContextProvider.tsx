import { createContext, useReducer } from "react";
import {
  AppState,
  StateContextType,
  defaultAppState,
} from "../../state/AppState";
import LocalStorage from "../../util/LocalStorage";
import { appStateReducer } from "../../state/AppStateReducer";
import { useParams } from "react-router";

export interface StateContextProviderProps {
  streamer?: string;
  children: any;
}

export const StateContext = createContext<StateContextType>({
  dispatch: undefined,
  state: defaultAppState,
});

export const StateContextProvider = (props: StateContextProviderProps) => {
  const streamerName = props.streamer;

  const rawPersistedState = LocalStorage.get(`appState_${streamerName}`);
  const [appState, appStateDispatch] = useReducer(appStateReducer, {
    ...(rawPersistedState ? JSON.parse(rawPersistedState) : defaultAppState),
    streamer: streamerName,
  } as AppState);

  return (
    <StateContext.Provider
      value={{
        dispatch: appStateDispatch,
        state: appState,
      }}
    >
      {props.children}
    </StateContext.Provider>
  );
};
