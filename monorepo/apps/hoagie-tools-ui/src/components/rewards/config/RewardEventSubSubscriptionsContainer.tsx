import { CreateSubscriptionInput, TwitchSubscription } from "@hoagie/service-clients"
import { RewardEventSubSubscriptions } from "./RewardEventSubSubscriptions"
import { useCallback, useContext, useEffect, useState } from "react";
import { AccessTokenInfo, ConfigClient, TokenCategory, ValidationResult } from "@hoagie/config-service";
import { StateContext } from "../../context/StateContextProvider";
import { LoginContext } from "../../context/LoginContextProvider";
import Config from "../../../Config";
import { CircularProgress } from "@mui/material";
import { TokenType } from "@hoagie/stream-rewards";

export const botId = "631768238"; // TODO configurable

export const RewardEventSubSubscriptionsContainer = () => {
  const { state: appState } = useContext(StateContext);
  const loginContext = useContext(LoginContext);
  const { state: loginState } = loginContext;

  const [subscriptions, setSubscriptions] = useState<TwitchSubscription[] | undefined>(undefined);
  const [tokenInfo, setTokenInfo] = useState<{ streamerToken: AccessTokenInfo | undefined, botToken: AccessTokenInfo | undefined } | undefined>(undefined);
  const [streamerTokenValidation, setStreamerTokenValidation] = useState<ValidationResult | undefined>(undefined);
  const [botTokenValidation, setBotTokenValidation] = useState<ValidationResult | undefined>(undefined);
  const [tokenLoading, setTokenLoading] = useState(false);

  const getSubscriptions = useCallback(async () => {
    if (loginState.userId && loginState.accessToken) {
      const client = new ConfigClient(loginState.userId, loginState.accessToken, Config.environment);
      const subs = await client.getTwitchEventSubSubscriptions();
      setSubscriptions(subs);
    }
  }, [loginState.userId, loginState.accessToken]);

  useEffect(() => {
    getSubscriptions();
  }, [getSubscriptions]);

const validateTokens = useCallback(async () => {
  if (loginState.userId && loginState.accessToken && appState.streamerId) {
    setTokenLoading(true);
    const configClient = new ConfigClient(loginState.userId, loginState.accessToken, Config.environment);
    const streamerTokenResult = await configClient.validateAccessToken(appState.streamerId, "REWARDS");
    const botTokenResult = await configClient.validateAccessToken(botId, "BOT");
    setStreamerTokenValidation(streamerTokenResult);
    setBotTokenValidation(botTokenResult);
    setTokenLoading(false);
  }
}, [loginState.userId, loginState.accessToken, appState.streamerId]);

useEffect(() => {
  validateTokens();
}, [validateTokens]);
  console.log({ subscriptions, appState });

  if (!appState.streamerId) {
    return <CircularProgress />
  }

  return (
    <RewardEventSubSubscriptions
      broadcasterLogin={appState.streamer ?? ""}
      broadcasterId={appState.streamerId}
      loggedInUserId={loginState.userId ?? ""}
      subscriptions={subscriptions ?? []}

      broadcasterTokenValidation={streamerTokenValidation}
      botTokenValidation={botTokenValidation}
      isLoading={tokenLoading}

      refetchSubscriptions={getSubscriptions}
    />
  )
}
