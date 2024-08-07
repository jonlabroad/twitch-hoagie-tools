export interface ConnectionConfig {
  type: string;
  scopes: string[];
}

export const botAccountConnectionConfig: ConnectionConfig = {
  type: "BOT",
  scopes: ["user:write:chat"]
};
