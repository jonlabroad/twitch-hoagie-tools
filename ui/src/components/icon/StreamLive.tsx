import { FlexRow } from "../util/FlexBox"
import "./StreamLiveIcon.scss"

interface StreamLiveIconProps {
    isLive: boolean
}

export const StreamLiveIcon = (props: StreamLiveIconProps) => {
    if (!props.isLive) {
        return <></>
    }

    return <FlexRow alignItems="center" justifyContent="center" className="stream-live-icon">LIVE</FlexRow>
};
