export default class Config {
    private static readonly envVars = ["STAGE", "TWITCH_CLIENT_ID", "TWITCH_CLIENT_SECRET"];

    public static stage = process.env.STAGE ?? "local";
    public static twitchClientId = process.env.TWITCH_CLIENT_ID ?? "";
    public static twitchClientSecret = process.env.TWITCH_CLIENT_SECRET ?? "";
    public static subscriptionSecret = process.env.SUBSCRIPTION_SECRET ?? "";
    public static tableName = process.env.TABLENAME ?? "";

    // TODO put in database and allow admins to add/remove other admins
    public static AdminUserNames = [
        "hoagieman5000",
        "hoagiebot5000",
    ];

    public static StreamerUserNames = [
        "thesongery"
    ];

    public static validate(additionalVars?: string[]) {
        [...Config.envVars, ...(additionalVars ?? [])].forEach(varName => {
            if (!process.env[varName]) {
                throw new Error(`Missing env var ${varName}`);
            }
        })
    }

    public static isAdminOrStreamer(username: string) {
        return Config.isAdmin(username) || Config.StreamerUserNames.includes(username);
    }

    public static isAdmin(username: string) {
        return Config.AdminUserNames.includes(username);
    }
}