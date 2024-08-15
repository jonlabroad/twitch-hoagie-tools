import { Button } from '@mui/material';
import React from 'react';
import { ConnectionConfig } from './ConnectionConfig';
import Config from '../../Config';

export interface ConnectionPageProps {
  connectionConfig: ConnectionConfig;
}

const ConnectionPage = (props: ConnectionPageProps) => {
  const { connectionConfig } = props;

  const redirectUri = `https://config.hoagieman.net/api/v1/access/twitchtoken/${connectionConfig.type.toLowerCase()}`;

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        href={`https://id.twitch.tv/oauth2/authorize?scope=${connectionConfig.scopes.join(' ')}&client_id=${Config.clientId}&redirect_uri=${redirectUri}&response_type=code&force_verify=true`}
      >
        Connect
      </Button>
    </div>
  );
};

export default ConnectionPage;
