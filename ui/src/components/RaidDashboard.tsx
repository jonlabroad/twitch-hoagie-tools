import { Grid } from "@mui/material";
import React, { useEffect } from "react";
import { useParams } from "react-router";
import Config from "../Config";
import LocalStorage from "../util/LocalStorage";
import { PageHeader } from "./PageHeader";
import { RaidContainer } from "./raid/RaidContainer";
import { ChannelInfoProvider } from "./data/ChannelInfoProvider";
import { StateContextProvider } from "./context/StateContextProvider";
import { useStreamerName } from "../hooks/useStreamerName";

export interface RaidDashboardProps {}

export const RaidDashboard = (props: RaidDashboardProps) => {
  useStreamerName();

  useEffect(() => {
    const path = window.location.pathname;
    LocalStorage.set("lastPath", { path });
  }, []);

  return (
    <React.Fragment>
      <div style={{ margin: 12 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <RaidContainer />
          </Grid>
        </Grid>
      </div>
      <ChannelInfoProvider />
    </React.Fragment>
  );
};
