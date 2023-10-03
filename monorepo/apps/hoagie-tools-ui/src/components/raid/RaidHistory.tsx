import { Hidden, Tooltip, Typography } from "@mui/material";
import { FlexCol, FlexRow } from "../util/FlexBox";
import { RaidEvent } from "./RaidEvent";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";

export interface RaidHistoryProps {
  raidsIn: RaidEvent[];
  raidsOut: RaidEvent[];
}

function toDaysAgo(t1: number) {
  const days1 = t1 / 1000 / 60 / 60 / 24;
  const days2 = new Date().getTime() / 1000 / 60 / 60 / 24;
  return Math.round(days2 - days1);
}

const RaidInfo = (props: {
  timestamp: number;
  viewers: number;
  type: string;
}) => {
  const date = new Date(props.timestamp);
  const daysAgo = toDaysAgo(props.timestamp);
  return (
    <FlexRow flexGrow={1} justifyContent="space-between">
      <Tooltip title={`${props.type.toUpperCase()} ${date.toLocaleString()}`}>
        <Typography style={{ width: "100%", fontSize: 14, marginRight: 5 }}>
          {daysAgo} days
        </Typography>
      </Tooltip>
      <Hidden lgDown>
        <Typography style={{ fontSize: 12 }}>{props.viewers}</Typography>
      </Hidden>
    </FlexRow>
  );
};

export const RaidHistory = (props: RaidHistoryProps) => {
  const { raidsIn, raidsOut } = props;

  let allRaids = [
    ...raidsIn.map((raid) => ({
      raid,
      type: "in",
    })),
    ...raidsOut.map((raid) => ({
      raid,
      type: "out",
    })),
  ];

  const sortedRaids = allRaids.sort(
    (r1, r2) => r2.raid.timestamp - r1.raid.timestamp
  );

  return (
    <FlexCol flexGrow={1}>
      {sortedRaids.map((raid) => (
        <FlexRow flexGrow={1} alignItems="center">
          <InOutIcon type={raid.type} />
          <RaidInfo
            timestamp={raid.raid.timestamp}
            viewers={raid.raid.viewers}
            type={raid.type}
          />
        </FlexRow>
      ))}
    </FlexCol>
  );
};

const InOutIcon = (props: { type: string }) => {
  return (
    <div style={{ marginRight: 10 }}>
      {props.type === "in" ? (
        <LoginIcon color="success" fontSize="small" />
      ) : (
        <LogoutIcon color="warning" fontSize="small" />
      )}
    </div>
  );
};
