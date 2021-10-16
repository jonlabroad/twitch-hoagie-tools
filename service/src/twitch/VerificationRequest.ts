export interface EventSubscription {
    id: string
    status: string
    type: string
    version: string
    cost: number
    condition: Record<string, string>
    transport: {
        method: string
        callback: string
    },
    created_at: string
}

export interface VerificationRequest {
    challenge: string
    subscription: EventSubscription
}
