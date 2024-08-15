import { TwitchClient, UserData } from "@hoagie/service-clients";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { LoginContext } from "../components/context/LoginContextProvider";
import { createTwitchClient } from "../util/CreateTwitchClient";
import { AddUsersInput } from "../components/context/TwitchUserInfoProvider";

interface UsersInput {
  userLogins: string[];
  userIds: string[];
}

export const useTwitchUserData = (props: {
  initialUsers: UsersInput;
}) => {
  const { initialUsers } = props;

  const { state: loginState } = useContext(LoginContext);

  const [userLoginsToFetch, setUserLoginsToFetch] = useState(initialUsers.userLogins);
  const [userIdsToFetch, setUserIdsToFetch] = useState(initialUsers.userIds);
  const [userData, setUserData] = useState<{ [key: string]: UserData }>({});
  const usersLoading = useRef(new Set<string>());

  const fetchUsers = useCallback(async () => {
    if (loginState.accessToken) {
      const client = createTwitchClient(loginState.accessToken);
      const toFetchLogins = userLoginsToFetch.filter((u) => !userData[u.toLowerCase()] && !usersLoading.current.has(u.toLowerCase()));
      const toFetchIds = userIdsToFetch.filter((u) => !userData[u.toLowerCase()] && !usersLoading.current.has(u.toLowerCase()));
      toFetchLogins.forEach((u) => usersLoading.current.add(u.toLowerCase()));
      try {
        const users = await client.getUsersData(
          toFetchLogins,
          toFetchIds
        );
        if (!users) {
          throw new Error("Couldn't get users, use backup method.");
        }
        if (users && users.length > 0) {
          setUserData((prev) => {
            const newUserData = { ...prev };
            users.forEach((u) => {
              newUserData[u.login.toLowerCase()] = u;
            });
            return newUserData;
          });
        }
      } catch (e) {
        console.error(e);
        // Backup (when a dono user login doesn't exist on Twitch)
        const userDataResults = (await Promise.all(toFetchLogins.map(async (u) => {
          try {
            return await client.getUserData(u);
          } catch (e) {
            return undefined;
          }
        })));
        const userData = userDataResults.filter(ud => !!ud) as UserData[];
        if (userData.length > 0) {
          setUserData((prev) => {
            const newUserData = { ...prev };
            userData.forEach((u) => {
              newUserData[u.login.toLowerCase()] = u;
            });
            return newUserData;
          });
        }
      } finally {
        toFetchLogins.forEach((u) => usersLoading.current.delete(u.toLowerCase()));
      }
    }
  }, [userLoginsToFetch, userIdsToFetch, usersLoading, userData, loginState.accessToken]);

  useEffect(() => {
    if (userLoginsToFetch.length > 0 || userIdsToFetch.length > 0) {
      fetchUsers();
    }
  }, [userLoginsToFetch, userIdsToFetch, loginState.accessToken]);

  const addUsers = async (users: AddUsersInput) => {
    let changed = false;
    const newUserLoginsToFetch = [...users.userLogins];
    const newUserIdsToFetch = [...users.userIds];
    users.userLogins.forEach((username) => {
      if (!userLoginsToFetch.includes(username.toLowerCase())) {
        changed = true;
        newUserLoginsToFetch.push(username.toLowerCase());
      }
    });
    users.userIds.forEach((userId) => {
      if (!userIdsToFetch.includes(userId.toLowerCase())) {
        changed = true;
        newUserIdsToFetch.push(userId.toLowerCase());
      }
    });

    if (changed) {
      setUserLoginsToFetch(newUserLoginsToFetch);
      setUserIdsToFetch(newUserIdsToFetch);
    }
  };

  return {
    userData,
    addUsers,
  };
}
