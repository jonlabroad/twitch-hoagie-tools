import { Tooltip } from "@mui/material";
import { FlexRow } from "../util/FlexBox";

export const SslIcon = (props: {}) => (
  <FlexRow alignItems="center">
    <Tooltip title="On SSL song list">
      <div style={{ height: 20 }}>
        <img style={{ height: 20 }} src="/image/ssl-icon.png" />
      </div>
    </Tooltip>
  </FlexRow>
);
