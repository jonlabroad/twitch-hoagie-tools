import {
  Grid,
  Button,
  Typography,
  FormControl,
  FormControlLabel,
  Checkbox,
  TextField,
} from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import { FlexCol, FlexRow } from '../../util/FlexBox';
import { StateContext } from '../../context/StateContextProvider';
import { useStreamerConfig } from '../../../hooks/useStreamerConfig';
import { useTwitchPlusData } from '../../../hooks/useTwitchPlusData';
import { defaultStreamerConfigData } from '@hoagie/streamer-service';

interface IProps {}

export const TwitchPlusModule = (props: IProps) => {
  const { state: appState } = useContext(StateContext);

  const [savedConfig, saveConfig] = useStreamerConfig(appState.streamerId);
  const [config, setConfig] = useState(
    savedConfig ?? defaultStreamerConfigData
  );

  useEffect(() => {
    setConfig(savedConfig ?? defaultStreamerConfigData);
  }, [savedConfig]);

  const trackingChecked = !!config?.twitchPlus.trackingEnabled;
  const plusGoal = config?.twitchPlus.goal ?? 100;

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
                onChange={() => {
                  saveConfig({
                    ...config,
                    twitchPlus: {
                      ...config?.twitchPlus,
                      trackingEnabled: !trackingChecked,
                    },
                  });
                }}
              />
            }
          />

          <FlexRow width={100} marginTop={1}>
            <TextField
              fullWidth
              label="Goal"
              value={config.twitchPlus.goal}
              onChange={(e) => {
                setConfig({
                  ...config,
                  twitchPlus: {
                    ...config?.twitchPlus,
                    goal: e.target.value ? parseInt(e.target.value) : 0,
                  },
                });
              }}
            />
          </FlexRow>
          <FlexRow marginTop={1}>
            <Button
              color="primary"
              variant="contained"
              onClick={() => saveConfig(config)}
            >
              Save Plus Config
            </Button>
          </FlexRow>
        </FormControl>
      </FlexCol>
    </Grid>
  );
};
