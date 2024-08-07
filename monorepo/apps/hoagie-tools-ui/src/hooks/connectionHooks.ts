import qs from 'qs';
import { useEffect, useState } from 'react';

export function useConnection() {
  const [authorizationCode, setAuthorizationCode] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function connect() {
      if (window.location.search) {
        // User redirected from Twitch oauth
        const parsed = qs.parse(window.location.search.replace("?", ""));
        setAuthorizationCode(parsed.code as string);
      }
    }
    connect();
  }, []);

  return { authorizationCode };
}
