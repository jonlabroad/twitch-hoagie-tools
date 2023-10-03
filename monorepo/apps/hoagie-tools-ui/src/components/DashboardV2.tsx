import React, { useContext, useEffect } from "react";
import LocalStorage from "../util/LocalStorage";
import { StateContext } from "./context/StateContextProvider";
import { useSearchParams } from "react-router-dom";
import { useStreamerName } from "../hooks/useStreamerName";

export interface MainPageProps {}

export const DashboardV2 = (props: MainPageProps) => {
  const { state } = useContext(StateContext)
  useStreamerName()

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const path = window.location.pathname;
    LocalStorage.set("lastPath", { path });
  }, []);

  return (
    <React.Fragment>
      <div>HAI {state.streamer}</div>
    </React.Fragment>
  );
};
