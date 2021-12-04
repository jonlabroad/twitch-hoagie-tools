import { ChatMessage } from "./ChatMessageParser";

export interface AnalysisResultMessage {
    type: "message-analysis",
    message: string,
    results: Record<string, number>
}