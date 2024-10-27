import { Button } from "@mui/material";
import { ConnectionConfig, createConnectUrl } from "./ConnectionConfig";
import Config from "../../Config";

interface Props {
  config: ConnectionConfig;
  label?: string;
  disabled?: boolean;
}

export const ConnectButton = (props: Props) => {
  const { config } = props;

  const link = createConnectUrl(config);

  return (
    <div>
      <Button
        disabled={props.disabled}
        variant="contained"
        color="primary"
        href={link}
      >
        {props.label ?? "(Re)Connect"}
      </Button>
    </div>
  );
}
