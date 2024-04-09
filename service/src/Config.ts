export default class Config {
    private static readonly envVars = ["STAGE", "TWITCH_CLIENT_ID", "TWITCH_CLIENT_SECRET"];

    public static stage = process.env.STAGE ?? "local";
    public static twitchClientId = process.env.TWITCH_CLIENT_ID ?? "";
    public static twitchClientSecret = process.env.TWITCH_CLIENT_SECRET ?? "";
    public static subscriptionSecret = process.env.SUBSCRIPTION_SECRET ?? "";
    public static tableName = process.env.TABLENAME ?? "";
    public static ChatEventSource = {
        clusterName: "TwitchChatEventSource",
        serviceName: "TwitchChatEventSource",        
    };

    // TODO put in database
    public static AdminUserIds = [
        "408982109",
    ];

    public static validate(additionalVars?: string[]) {
        [...Config.envVars, ...(additionalVars ?? [])].forEach(varName => {
            if (!process.env[varName]) {
                throw new Error(`Missing env var ${varName}`);
            }
        })
    }

    public static isAdmin(userId: string) {
        return Config.AdminUserIds.includes(userId);
    }
}