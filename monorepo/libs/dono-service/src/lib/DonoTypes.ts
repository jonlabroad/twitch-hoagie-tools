export interface UserDonoSummary {
  username: string;
  userId: string | undefined,
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
    twitchUserId: string | undefined
    streamId: string
    broadcasterId: string
    amount: number
    subTier?: string
    subRecipient?: string
    type: string
    timestamp: string
    ExpirationTTL: number
}

export type UserDonoSummaries = Record<string, UserDonoSummary>

export interface DonoDataResponse {
    data: UserDonoSummaries
}
