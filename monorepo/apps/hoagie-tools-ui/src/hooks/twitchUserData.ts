import { TwitchClient, UserData } from "@hoagie/service-clients";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { LoginContext } from "../components/context/LoginContextProvider";
import { createTwitchClient } from "../util/CreateTwitchClient";

export const useTwitchUserData = (props: {
  initialUsers: string[];
}) => {
  const { initialUsers } = props;

  const { state: loginState } = useContext(LoginContext);

  const [usersToFetch, setUsersToFetch] = useState(initialUsers);
  const [userData, setUserData] = useState<{ [key: string]: UserData }>({});
  const usersLoading = useRef(new Set<string>());

  const fetchUsers = useCallback(async () => {
    if (loginState.username && loginState.accessToken) {
      const client = createTwitchClient(loginState.accessToken);
      const toFetchLogins = usersToFetch.filter((u) => !userData[u.toLowerCase()] && !usersLoading.current.has(u.toLowerCase()));
      toFetchLogins.forEach((u) => usersLoading.current.add(u.toLowerCase()));
      try {
        const users = await client.getUsersData(
          toFetchLogins
        );
        console.log({ users });
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
  }, [usersToFetch, usersLoading, userData, loginState.username, loginState.accessToken]);

  useEffect(() => {
    if (usersToFetch.length > 0) {
      fetchUsers();
    }
  }, [usersToFetch]);

  const addUsers = async (userLogins: string[]) => {
    let changed = false;
    const newUsersToFetch = [...usersToFetch];
    userLogins.forEach((username) => {
      if (!usersToFetch.includes(username.toLowerCase())) {
        changed = true;
        newUsersToFetch.push(username.toLowerCase());
      }
    });
    if (changed) {
      setUsersToFetch(newUsersToFetch);
    }
  };

  return {
    userData,
    addUsers,
  };
}
