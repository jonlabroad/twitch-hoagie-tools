import { Button } from "@mui/material";

export const CopyButton = (props: { label: string, value: string }) => {
  const { label, value } = props;

  const copy = () => {
    navigator.clipboard.writeText(value);
  }

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={copy}
      >
        {label}
      </Button>
    </div>
  );
}
