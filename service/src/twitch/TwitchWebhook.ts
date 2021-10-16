export default interface TwitchWebhookEvent<T> {
    subscription: {
        id: string
        type: string
        version: string
        status: string
        cost: number
        condition: {
            broadcaster_user_id: string
        },
        transport: {
            method: string
            callback: string
        },
        created_at: string
    },
    event: T
}