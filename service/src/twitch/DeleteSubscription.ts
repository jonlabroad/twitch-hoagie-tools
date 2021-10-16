import TwitchClient from "./TwitchClient";

export default class DeleteSubscriptions {
    public static async delete(id: string): Promise<any> {
        const client = new TwitchClient();
        console.log(`Attempting to delete subscription ${id}`);
        const response = await client.deleteSubscription(id);
        console.log({statusCode: response.statusCode, data: response.data})
        return response;
    }
}