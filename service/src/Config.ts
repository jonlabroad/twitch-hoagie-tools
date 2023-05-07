export default class Config {
    private static readonly envVars = ["STAGE", "TWITCH_CLIENT_ID", "TWITCH_CLIENT_SECRET"];

    public static stage = process.env.STAGE ?? "local";
    public static twitchClientId = process.env.TWITCH_CLIENT_ID ?? "";
    public static twitchClientSecret = process.env.TWITCH_CLIENT_SECRET ?? "";
    public static subscriptionSecret = process.env.SUBSCRIPTION_SECRET ?? "";
    public static tableName = process.env.TABLENAME ?? "";
    public static GeniusClientId = "2vmZ-eHDI3UGd_QIiS_rMjVz37mwmRAOLbQIzbO6PhDtN0QHfuN11NyJ99XTHiqV";
    public static GeniusClientSecret = process.env.GENIUS_CLIENT_SECRET ?? "";
    public static BadWordsSecret = process.env.BAD_WORDS_SECRET ?? "";

    // TODO put in database
    public static AdminUserNames = [
        "hoagieman5000",
    ];

    public static validate(additionalVars?: string[]) {
        [...Config.envVars, ...(additionalVars ?? [])].forEach(varName => {
            if (!process.env[varName]) {
                throw new Error(`Missing env var ${varName}`);
            }
        })
    }

    public static isAdmin(username: string) {
        return Config.AdminUserNames.includes(username);
    }
}