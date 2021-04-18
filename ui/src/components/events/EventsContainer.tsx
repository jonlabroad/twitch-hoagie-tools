import React, { useContext, useEffect, useRef, useState } from "react";
import EventGenerator from "../../events/EventGenerator";
import { ChatMessage } from "../chat/SimpleChatDisplay";
import { StateContext } from "../MainPage";
import { EventCard } from "./EventCard";

export interface EventsContainerProps {

}

export const EventsContainer = (props: EventsContainerProps) => {
    const stateContext = useContext(StateContext);
    const { chat, event } = stateContext.state;

    const eventGenerator = useRef(new EventGenerator());

    const [lastMessage, setLastMessage] = useState<ChatMessage | undefined>(undefined);

    useEffect(() => {
        if (chat.messages.length > 0) {
            setLastMessage(chat.messages[chat.messages.length - 1]);
        }
    }, [chat.messages]);

    useEffect(() => {
        async function processMsg() {
            if (lastMessage) {
                const events = await eventGenerator.current.fromChatMessage(lastMessage);
                events.forEach(ev => {
                    stateContext.dispatch({
                        type: "add_event",
                        event: ev,
                    });    
                });
            }
        }
        processMsg();
    }, [lastMessage])

    return (<React.Fragment>
        {/* event.events.map((event, i) => (
            <React.Fragment key={i}>
                <EventCard key={i}
                    event={event}
                />
            </React.Fragment>
        ))*/}
    </React.Fragment>
    );
}