import { useContext, useEffect, useRef, useState } from "react";
import { StateContext } from "../components/context/StateContextProvider";
import { LoginContext } from "../components/context/LoginContextProvider";
import { FlexCol, FlexRow } from "../components/util/FlexBox";
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import LoginUtil from "../util/LoginUtil";
import Config from "../Config";
import TwitchChatClient from "../service/TwitchChatClient";
import { useTwitchChatClient } from "../hooks/chatClientHooks";
import { ChannelInfoProvider } from "../components/data/ChannelInfoProvider";
import { useSaveLastPath } from "../hooks/LastPathHooks";
import { useStreamerName } from "../hooks/useStreamerName";

import en from 'javascript-time-ago/locale/en'
import TimeAgo from "javascript-time-ago";
import LocalStorage from "../util/LocalStorage";
import { TwitchUserInfoContext } from "../components/context/TwitchUserInfoProvider";
import { TwitchAvatar } from "../components/avatar/TwitchAvatar";
import { TwitchClient } from "@hoagie/service-clients";
import { createTwitchClient } from "../util/CreateTwitchClient";
import { StateReasonCode } from "@aws-sdk/client-lambda";
const timeAgo = new TimeAgo('en-US');

TimeAgo.addDefaultLocale(en)

const whisperScopes = "user:manage:whispers user:read:chat chat:read";

interface ChatUserData {
  username: string;
  lastMessageTime: string;
  whisper: {
    message: string;
    timestamp: string
  } | undefined
}

type AllChatUserData = Record<string, ChatUserData>;

const getDataStoreKey = (streamerId: string) => `bulkWhisperUserData-${streamerId}`;
const getWhisperDataStoreKey = (streamerId: string) => `bulkWhisperMessage-${streamerId}`;

export const BulkWhisperPage = () => {
  useSaveLastPath();
  useStreamerName();

  const { state } = useContext(StateContext);

  const loginContext = useContext(LoginContext);
  const { state: loginState, setState: setLoginState } = loginContext;

  const [initialized, setInitialized] = useState(false);
  const [userData, setUserData] = useState<AllChatUserData>({});
  const [whisperMessage, setWhisperMessage] = useState<string>("");
  const [lastMessageTimestampProcessed, setLastMessageTimestampProcessed] = useState<string | null>(null);

  const { userData: twitchUserData, addUsers } = useContext(TwitchUserInfoContext);

  useEffect(() => {
    if (addUsers && userData) {
      const userLogins = Object.keys(userData);
      addUsers({
        userLogins: userLogins,
        userIds: [],
      });
    }
  }, [addUsers, userData]);

  const twitchChat = useTwitchChatClient();

  useEffect(() => {
    if (state.streamerId && !initialized) {
      const initialData = (JSON.parse(LocalStorage.get(getDataStoreKey(state.streamerId))) ?? {}) as AllChatUserData;
      const whisperMessage = JSON.parse(LocalStorage.get(getWhisperDataStoreKey(state.streamerId) ?? {}));
      setUserData(initialData);
      setWhisperMessage(whisperMessage?.message ?? "");
      setInitialized(true);
    }
  }, [state.streamerId]);

  useEffect(() => {
    if (!state.streamerId || !initialized) {
      return;
    }

    const newMessages = state.chat.messages.filter(msg => msg.timestamp > (new Date(lastMessageTimestampProcessed ?? 0))).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    if (newMessages.length > 0) {
      const newUserData = { ...userData };
      newMessages.forEach(msg => {
        const userLower = msg.username.toLowerCase();
        if (!newUserData[userLower]) {
          newUserData[userLower] = {
            username: msg.username,
            lastMessageTime: msg.timestamp.toISOString(),
            whisper: undefined
          };
        } else {
          newUserData[userLower].lastMessageTime = msg.timestamp.toISOString();
        }
      });
      setUserData(newUserData);
      LocalStorage.set(getDataStoreKey(state.streamerId), newUserData);
      setLastMessageTimestampProcessed(newMessages[newMessages.length - 1].timestamp.toISOString());
    }

  }, [state.chat.messages, initialized]);

  function getTimeSince(timestamp: string) {
    try {
      return timeAgo.format(new Date(timestamp))
    } catch (err) {
      console.error(err);
      return "Error???";
    }
  }

  async function onSendWhisper(toUserId: string, toUsername: string) {
    if (!state.streamerId || !loginState.accessToken || !loginState.userId) {
      return;
    }
    const twitchClient = createTwitchClient(loginState.accessToken);
    const fromUserId = loginState.userId;
    const response = await twitchClient.sendWhisperMessage(toUserId, whisperMessage, fromUserId);
    if (response.status === 200 || response.status === 204) {
      const newUserData = { ...userData };
      newUserData[toUsername.toLowerCase()] = {
        ...newUserData[toUsername.toLowerCase()],
        whisper: {
          message: whisperMessage,
          timestamp: new Date().toISOString()
        }
      };
      setUserData(newUserData);
      LocalStorage.set(getDataStoreKey(state.streamerId), newUserData);
    }

    return response;
  };

  return (
    <div>
        {loginState.isLoggedIn ? (
            <FlexRow alignItems="center">
              <div>{loginState.username}</div>
              <Button
                style={{
                  marginLeft: 10,
                }}
                variant="contained"
                color="secondary"
                onClick={() => LoginUtil.logout()}
              >
                Log Out
              </Button>
            </FlexRow>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              href={`https://id.twitch.tv/oauth2/authorize?scope=${Config.scopes}${whisperScopes ? ` ${whisperScopes}` : ''}&client_id=${Config.clientId}&redirect_uri=${Config.redirectUri}&response_type=token&force_verify=true`}
            >
              Login For Whispers
            </Button>
          )}
        <div>
          {twitchChat.current?.connected ? "Chat Connected" : "Chat Not Connected"}
        </div>
        {state.streamerId && (
          <TextField
            id="whisper-message"
            label="Whisper Message"
            multiline
            value={whisperMessage}
            onChange={(e) => {
              LocalStorage.set(getWhisperDataStoreKey(state.streamerId!), {
                message: e.target.value
              });
              setWhisperMessage(e.target.value)}
            }
          />
    )}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 400, maxWidth: 1024 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Last Message</TableCell>
                <TableCell>Whispered?</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(userData).map(userKey => {
                const user = userData[userKey];
                const twitchUser = twitchUserData?.[user.username.toLowerCase()];
                const timeSince = getTimeSince(user.lastMessageTime);
                return (
                  <TableRow key={userKey}>
                    <TableCell>
                      <FlexRow alignItems="center">
                        <TwitchAvatar username={user.username} avatarImageUrl={twitchUserData?.[user.username.toLowerCase()]?.profile_image_url} />
                        {user.username}
                      </FlexRow>
                    </TableCell>
                    <TableCell>{timeSince}</TableCell>
                    <TableCell>{user.whisper?.timestamp ? new Date(user.whisper.timestamp).toLocaleString() : "-"}</TableCell>
                    <TableCell>
                      {twitchUser?.id && !user.whisper && (
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={() => onSendWhisper(twitchUser.id, user.username)}
                        >
                          Send Whisper
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <ChannelInfoProvider />
    </div>
  );
}
