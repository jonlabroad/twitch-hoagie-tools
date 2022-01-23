import AdminDbClient, { AdminData } from "../channelDb/AdminDbClient";

export default class ConfigProvider {
    public static async get() {
        const client = new AdminDbClient();
        const config = await client.read();
        return config;
    }

    public static async set(config: AdminData) {
        const client = new AdminDbClient();
        await client.set(config);
    }

    public static async setStreamers(streamers: string[]) {
        const client = new AdminDbClient();
        await client.setStreamers(streamers);
    }
}