import { Grid } from "@mui/material";
import React, { useEffect } from "react";
import LocalStorage from "../util/LocalStorage";
import { RaidContainer } from "./raid/RaidContainer";
import { ChannelInfoProvider } from "./data/ChannelInfoProvider";
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
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <RaidContainer />
          </Grid>
        </Grid>
      <ChannelInfoProvider />
    </React.Fragment>
  );
};
