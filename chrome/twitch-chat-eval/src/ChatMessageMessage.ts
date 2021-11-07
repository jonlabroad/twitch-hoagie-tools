export interface ChatMessageMessage {
    type: string,
    data: {
        tab?: number;
        message: string
    }
}