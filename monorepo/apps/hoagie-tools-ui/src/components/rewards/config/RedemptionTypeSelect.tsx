import { CustomReward } from '@hoagie/service-clients';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export interface IProps {
  value: string | undefined;
  options: CustomReward[];

  onChange: (value: string) => void;
}

export const RedemptionTypeSelect = (props: IProps) => {
  return (
    <FormControl fullWidth>
      <InputLabel id="redemption-select-label">Redemption</InputLabel>
      <Select
        labelId="redemption-select-label"
        id="redemption-select"
        value={props.value}
        label="Redemption"
        onChange={(e) => props.onChange(e.target.value as string)}
      >
        {props.options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
