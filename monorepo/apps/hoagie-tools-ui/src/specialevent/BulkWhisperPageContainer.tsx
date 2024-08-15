import { TwitchUserInfoProvider } from "../components/context/TwitchUserInfoProvider"
import { BulkWhisperPage } from "./BulkWhisperPage"

export const BulkWhisperPageContainer = () => {
  return (
    <TwitchUserInfoProvider>
      <BulkWhisperPage />
    </TwitchUserInfoProvider>
  )
}
