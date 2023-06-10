import { CommandResult } from "./ChatCommandProcessor";
import { SSLParamsBase } from "./SSLRandomSongCommand";

export interface SSLAuthorizedRequestCommandParams extends SSLParamsBase {
    username: string
    q: string
}

export class SSLAuthorizedRequestCommand {
    static parseParams(params: Record<string, string>) {
        const parsed: SSLAuthorizedRequestCommandParams = {
            username: params.username,
            token: params.accesstoken,
            streamerName: params.streamername,
            q: params.q
        }
        return parsed;
    }

    static async process(params: Record<string, string>): Promise<CommandResult> {
        console.log({params})
        const config = this.parseParams(params)

        // Determine if user is banned from this (by user id, hopefully? Not sure if we have that here actually)

        return {
            message: `@${config.username} ${config.q}`
        }
    }
}