import { ChatMessage } from "./ChatMessageParser";

export interface AnalysisResultMessage {
    type: "message-analysis",
    message: ChatMessage,
    results: Record<string, number>
}