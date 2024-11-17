import { ConfigClient } from "@hoagie/config-service"
import { Button, CircularProgress } from "@mui/material"
import Config from "../../../Config";
import { CreateSubscriptionInput } from "@hoagie/service-clients";
import { useContext, useState } from "react";
import { LoginContext } from "../../context/LoginContextProvider";
import { StateContext } from "../../context/StateContextProvider";

interface IProps {
  label?: string
  disabled?: boolean
  subscriptions: CreateSubscriptionInput[]
}

export const EventSubConnectButton = (props: IProps) => {
  const { state } = useContext(StateContext)

  const loginContext = useContext(LoginContext);
  const { state: loginState } = loginContext;

  const [loading, setLoading] = useState(false);

  const labelText = props.label || 'Connect'

  const subscribe = async (userId: string, accessToken: string) => {
    const configClient = new ConfigClient(userId, accessToken, Config.environment);
    try {
      const response = await configClient.createTwitchEventSubSubscriptions(props.subscriptions);
    } catch (e) {
      console.error(e);
    }
  }

  const onClick = async () => {
    if (loginState.userId && loginState.accessToken) {
      setLoading(true);
      await subscribe(loginState.userId, loginState.accessToken);
      setLoading(false);
    }
  }

  return (
    <div style={{ width: 120, marginBottom: 12 }}>
      <Button
        fullWidth
        variant="contained"
        color="primary"
        disabled={props.disabled || !loginState.userId || !loginState.accessToken || !state.streamerId}
        onClick={onClick}
      >
        {loading ? <CircularProgress size={28} thickness={3.6} /> : labelText}
      </Button>
    </div>
  )
}
