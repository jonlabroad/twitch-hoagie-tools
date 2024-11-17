import { Checkbox, FormControl, FormControlLabel } from '@mui/material';

export const EnabledCheckbox = (props: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) => {
  return (
    <FormControl fullWidth>
      <FormControlLabel
        label="Enabled"
        control={
          <Checkbox
            checked={props.enabled}
            onChange={() => props.onChange(!props.enabled)}
          />
        }
      />
    </FormControl>
  );
};
