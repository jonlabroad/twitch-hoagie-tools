import { SSLAuthorizedRequestCommand } from "./SSLAuthorizedRequestCommand";
import { SSLRandomSongCommand } from "./SSLRandomSongCommand";

export interface CommandResult {
  message: string;
}

export class ChatCommandProcessor {
  async process(
    command: string,
    params: Record<string, any>
  ): Promise<CommandResult> {
    switch (command.toLowerCase()) {
      case "sslrandomsong": {
        const result = await SSLRandomSongCommand.process(params);
        console.log({ result });
        return result;
      }
      case "sslauthorizedrequest": {
        const result = await SSLAuthorizedRequestCommand.process(params);
        console.log({ result });
        return result;
      }
      default:
        throw new Error(`Unknown command ${command}`);
    }
  }
}
