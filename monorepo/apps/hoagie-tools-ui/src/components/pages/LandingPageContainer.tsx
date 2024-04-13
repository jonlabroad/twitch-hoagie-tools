import { TwitchUserInfoProvider } from "../context/TwitchUserInfoProvider";
import { LandingPage } from "./LandingPage";

export const LandingPageContainer = () => {
  return (
    <TwitchUserInfoProvider>
      <LandingPage />
    </TwitchUserInfoProvider>
  );
}
