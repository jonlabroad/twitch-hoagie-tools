import { useContext, useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { CustomReward } from '@hoagie/service-clients';
import { IStreamRewardConfig } from '@hoagie/stream-rewards';
import { FlexRow } from '../../util/FlexBox';
import { RedemptionTypeSelect } from './RedemptionTypeSelect';
import { EnabledCheckbox } from './EnabledCheckbox';
import { HandlerTypeSelect } from './HandlerTypeSelect';

interface IProps {
  broadcasterId: string | undefined;
  savedConfig: IStreamRewardConfig | undefined;
  redemptionOptions: CustomReward[];

  onSaveConfig: (config: IStreamRewardConfig) => void;
}

export const RewardSetup = (props: IProps) => {
  const [selectedRedemption, setSelectedRedemption] = useState<
    CustomReward | undefined
  >(undefined);
  const [config, setConfig] = useState<IStreamRewardConfig | undefined>(
    props.savedConfig
  );

  useEffect(() => {
    setConfig(props.savedConfig);
  }, [props.savedConfig]);

  return (
    <div style={{ paddingBottom: 20 }}>
      <h2>Setup</h2>
      <TableContainer>
        <Table sx={{ maxWidth: 1024 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Enabled</TableCell>
              <TableCell>Redemption</TableCell>
              <TableCell>Handler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {config?.rewards.map((reward, index) => {
              return (
                <TableRow>
                  <TableCell width="30%">
                    <TextField
                      id={`reward-name-${index}`}
                      fullWidth
                      value={reward.name}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          rewards: config.rewards.map((r, i) =>
                            i === index ? { ...r, name: e.target.value } : r
                          ),
                        })
                      }
                    >
                      {reward.name}
                    </TextField>
                  </TableCell>
                  <TableCell width={60}>
                    <EnabledCheckbox
                      enabled={reward.enabled}
                      onChange={() =>
                        setConfig({
                          ...config,
                          rewards: config.rewards.map((r, i) =>
                            i === index ? { ...r, enabled: !r.enabled } : r
                          ),
                        })
                      }
                    />
                  </TableCell>
                  <TableCell width="25%">
                    <RedemptionTypeSelect
                      value={reward.redemptionId}
                      options={props.redemptionOptions}
                      onChange={(val) =>
                        setConfig({
                          ...config,
                          rewards: config.rewards.map((r, i) =>
                            i === index ? { ...r, redemptionId: val } : r
                          ),
                        })
                      }
                    />
                  </TableCell>
                  <TableCell width="20%">
                    <HandlerTypeSelect
                      value={reward.handlerType}
                      options={['improvRequest', 'liveLearnRequest']}
                      onChange={(val) =>
                        setConfig({
                          ...config,
                          rewards: config.rewards.map((r, i) =>
                            i === index ? { ...r, handlerType: val } : r
                          ),
                        })
                      }
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        variant="contained"
        color="primary"
        onClick={() =>
          props.broadcasterId &&
          setConfig({
            ...config,
            broadcasterId: props.broadcasterId,
            rewards: [
              ...(config?.rewards ?? []),
              {
                name: 'New Reward',
                redemptionId: undefined,
                enabled: false,
                handlerType: undefined,
                metadata: { version: '1.0' },
              },
            ],
          })
        }
      >
        Add
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => config && props.onSaveConfig(config)}
      >
        Save
      </Button>
    </div>
  );
};
