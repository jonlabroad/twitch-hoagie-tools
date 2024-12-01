import {
  Grid,
  Button,
  Typography,
  FormControl,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import { FlexCol, FlexRow } from '../../util/FlexBox';
import { StateContext } from '../../context/StateContextProvider';
import { useStreamerConfig } from '../../../hooks/useStreamerConfig';

interface IProps {}

export const TwitchPlusModule = (props: IProps) => {
  const { state: appState } = useContext(StateContext);

  const [config, saveConfig] = useStreamerConfig(appState.streamerId);
  const trackingChecked = !!config?.twitchPlus.trackingEnabled;

  return (
    <Grid item xs={12}>
      <FlexCol className="songlist-config-container">
        <FlexRow alignItems="center">
          <h2 style={{ marginRight: 20 }}>Twitch Plus Tracker</h2>
        </FlexRow>
        <FormControl fullWidth>
          <FormControlLabel
            label="Enabled"
            control={
              <Checkbox
                checked={trackingChecked}
                onChange={() =>
                  saveConfig({
                    ...config,
                    twitchPlus: {
                      ...config?.twitchPlus,
                      trackingEnabled: !trackingChecked,
                    },
                  })
                }
              />
            }
          />
        </FormControl>
      </FlexCol>
    </Grid>
  );
};
