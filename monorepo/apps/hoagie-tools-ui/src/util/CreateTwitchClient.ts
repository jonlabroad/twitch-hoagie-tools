import { TwitchClient } from "@hoagie/service-clients";
import Config from "../Config";

export function createTwitchClient(accessToken: string) {
    return new TwitchClient({
        clientId: Config.clientId,
        clientAuth: {
            accessToken: accessToken
        }
    });
}