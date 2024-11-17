import { IRewardType } from '@hoagie/stream-rewards';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export interface IProps {
  value: string | undefined;
  options: IRewardType[];

  onChange: (value: IRewardType) => void;
}

export const HandlerTypeSelect = (props: IProps) => {
  return (
    <FormControl fullWidth>
      <InputLabel id="handler-select-label">Handler</InputLabel>
      <Select
        labelId="handler-select-label"
        id="handler-select"
        value={props.value}
        label="Handler"
        onChange={(e) => props.onChange(e.target.value as IRewardType)}
      >
        {props.options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
