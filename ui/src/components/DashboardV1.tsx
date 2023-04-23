import {
  Grid,
} from "@mui/material";
import React, {
  createContext,
  useEffect,
} from "react";
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
import { StateContextProvider } from "./context/StateContextProvider";
import { AlertContextProvider } from "./context/AlertContextProvider";
import { useStreamerName } from "../hooks/useStreamerName";

export interface MainPageProps {}

export const DashboardV1 = (props: MainPageProps) => {
  useStreamerName()
  
  useEffect(() => {
    const path = window.location.pathname;
    LocalStorage.set("lastPath", { path });
  }, []);

  return (
    <React.Fragment>
        <AlertContextProvider>
          <div style={{ margin: 12 }}>
            <Grid container spacing={3}>
              <Grid item xs={3}>
                <ChannelHeader />
              </Grid>
              <Grid item xs={3}></Grid>
              <Grid item xs={3}></Grid>
              <Grid item xs={1}>
                <StreamerLinks />
              </Grid>
              <AlertContainer />
              <Grid item xs={12} md={6}>
                <SongQueue />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <RaidContainer />
            </Grid>
          </div>
          <EventsContainer />
        </AlertContextProvider>
    </React.Fragment>
  );
};
