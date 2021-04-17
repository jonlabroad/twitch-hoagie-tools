import { FlexRow } from "../util/FlexBox"
import StreamEvent, { ShoutoutStreamEvent } from "../../events/StreamEvent"

import "../../styles/AlertCard.scss"

export interface EventCardProps {
    event: StreamEvent;
}

export const EventCard = (props: EventCardProps) => {
    const shoutoutAlert = props.event as ShoutoutStreamEvent;
    return <FlexRow className="event-card">
        <div className="event-type">
            {shoutoutAlert.type}
        </div>
        <div className="event-username">
            {shoutoutAlert.chatMsg.username}
        </div>
    </FlexRow>
}