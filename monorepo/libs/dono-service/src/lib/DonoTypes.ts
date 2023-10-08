export interface UserDonoSummary {
  username: string;
  value: number;
  subs: number;
  subtier: string;
  subgifts: number;
  bits: number;
  dono: number;
  hypechat: number;
}

export interface DonoData {
    CategoryKey: string
    SubKey: string
    username: string
    streamId: string
    broadcasterId: string
    amount: number
    subTier?: string
    subRecipient?: string
    type: string
    timestamp: string
    ExpirationTTL: number
}

export interface DonoDataResponse {
    data: Record<string, UserDonoSummary>
}