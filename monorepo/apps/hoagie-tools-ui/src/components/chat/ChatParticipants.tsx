import React, { useContext, useEffect, useRef, useState } from "react";
import TwitchClient from "../../service/TwitchClientOld";
import { UserData, UserFollows } from "../../service/TwitchClientTypes";
import { FlexCol, FlexRow } from "../util/FlexBox";
import { ChatMessage } from "./SimpleChatDisplay";

import "../../styles/ChatUsers.scss";
import { Card } from "@mui/material";
import { StateContext } from "../context/StateContextProvider";

export interface ChatUser {
    userData: UserData
    userFollows?: UserFollows
    lastChat: Date
}

export interface ChatParticipantsProps {
    twitchClient?: TwitchClient;
}

const userExpiryMillis = 2 * 60 * 1e3;

export const ChatParticipants = (props: ChatParticipantsProps) => {
    const { state, dispatch } = useContext(StateContext);
    const [usersInChat, setUsersInChat] = useState<ChatUser[]>([]);
    const usersInChatRef = useRef(usersInChat);
    const intervalRef = useRef<any>(undefined);

    const [lastMessage, setLastMessage] = useState<ChatMessage | undefined>(undefined);

    const trimUsers = (users: ChatUser[]) => {
        const now = new Date();
        setUsersInChat(users.filter(user => now.getTime() - user.lastChat.getTime() < userExpiryMillis));
    }

    useEffect(() => {
        if (state.chat.messages.length > 0) {
            setLastMessage(state.chat.messages[state.chat.messages.length - 1]);
        }
    }, [state.chat.messages]);


    useEffect(() => {
        usersInChatRef.current = usersInChat;
    }, [usersInChat])
    useEffect(() => {
        setInterval(() => trimUsers(usersInChatRef.current), 500);

        return function cleanup() {
            clearInterval(intervalRef.current);
        }
    }, [])

    useEffect(() => {
        async function addUserToChat() {
            if (lastMessage && state.streamerData && props.twitchClient) {
                const user = lastMessage.username;
                const userDatas = await props.twitchClient.getUsers([user]);
                const userData = userDatas[0];
                const follows = await props.twitchClient.getUserFollows(userData.id);

                const existingUser = usersInChat.find(u => u.userData.id === userData.id);
                if (existingUser) {
                    setUsersInChat([{
                        userData,
                        userFollows: follows.length > 0 ? follows[0] : undefined,
                        lastChat: new Date(),
                    }, ...usersInChat.filter(u => u.userData.id !== userData.id)]);
                } else {
                    setUsersInChat([{
                        userData,
                        userFollows: follows.length > 0 ? follows[0] : undefined,
                        lastChat: new Date(),
                    }, ...usersInChat])
                }
            }
        }

        addUserToChat();
    }, [lastMessage]);

    return (
        <React.Fragment>
            <Card>
            <FlexCol>
                {usersInChat.map(user => (
                    <FlexRow className="chatusers-row" justifyContent="space-between">
                        <FlexRow>
                            <div className="chatusers-avatar">
                                <img src={user.userData.profile_image_url} />
                            </div>
                            <div className="chatusers-user">{user.userData.login}</div>
                        </FlexRow>
                        {user.userFollows && <div className="chatusers-follow">Follows</div>}
                    </FlexRow>
                ))}
            </FlexCol>
            </Card>
        </React.Fragment>
    );
}