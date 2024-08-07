export interface ConnectionConfig {
  type: string;
  scopes: string[];
}

export const botAccountConnectionConfig: ConnectionConfig = {
  type: "bot",
  scopes: ["user:write:chat"]
};
