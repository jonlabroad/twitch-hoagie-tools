import { Grid } from "@mui/material";
import React, { createContext, useContext, useEffect } from "react";
import { useParams } from "react-router";
import Config from "../Config";
import { defaultDonoState, DonoStateContextType } from "../state/DonoState";
import LocalStorage from "../util/LocalStorage";
import { AlertContainer } from "./alerts/AlertContainer";
import { ChannelHeader } from "./ChannelHeader";
import { EventsContainer } from "./events/EventsContainer";
import { PageHeader } from "./PageHeader";
import { RaidContainer } from "./raid/RaidContainer";
import { SongQueue } from "./ssl/SongQueue";
import { StreamerLinks } from "./StreamerLinks";
import { StateContext, StateContextProvider } from "./context/StateContextProvider";
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
