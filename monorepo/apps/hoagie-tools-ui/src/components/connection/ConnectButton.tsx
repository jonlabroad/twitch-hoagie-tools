import { Button } from "@mui/material";
import { ConnectionConfig } from "./ConnectionConfig";
import Config from "../../Config";

interface Props {
  config: ConnectionConfig;
}

export const ConnectButton = (props: Props) => {
  const { config } = props;

  const redirectUri = `https://config.hoagieman.net/api/v1/access/twitchtoken/${config.type.toLowerCase()}`;

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        href={`https://id.twitch.tv/oauth2/authorize?scope=${config.scopes.join(' ')}&client_id=${Config.clientId}&redirect_uri=${redirectUri}&response_type=code&force_verify=true`}
      >
        (Re)Connect
      </Button>
    </div>
  );
}
