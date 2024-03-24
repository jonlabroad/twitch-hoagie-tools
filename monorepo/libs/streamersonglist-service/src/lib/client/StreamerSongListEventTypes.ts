import { UserData } from "@hoagie/service-clients";

export type SongListEventType = "queue-event" | "queue-update" | "reload-song-list" | "update-song" | "new-playhistory" | string;

export interface SongListEvent {
  channel: string
  eventType: SongListEventType
  eventData: SongQueueEvent | SongUpdateEvent;
}

export interface SongListEventDescription {
  timestamp: string
  eventType: SongListEventType
  text: string
  userName: string
  userInfo?: UserData
  //songInfo: Record<number, any>
}

export interface SongQueueUpdateEvent {
  list: SongDetails[]
  previousPosition: number
  queue: QueueUpdate
  status: {
    songsPlayedToday: number
  }
}

export interface SongQueueEvent {
  artist: string
  by: string
  title: string
  nonlistSong?: string // Is this correct?
  byType: string
  updated?: boolean
  added?: boolean
  deleted?: boolean
  position?: number
  oldPosition?: number
}

export type SongUpdateEvent = number;

export interface SongDetails {
  song: {
    createdAt: string
    capo: string
    attributeIds: number[]
    artist: string
    comment: string
    id: number
    title: string
  }
  note: string | null
  createdAt: string
  nonlistSong: null
  streamerId: number
  botRequestedBy: null
  prevId: number | null
  id: number
  requests: {
    name: string
    note: string | null
    amount: number
    id: number
    source: string
    transactionId: number | null
  }[]
  position: number
  donationAmount: number
  songId: number
}

export interface QueueUpdate {
  song: {
    title: string
    artist: string
  }
  note: string
  createdAt: string
  nonlistSong: null
  streamerId: number
  botRequestedBy: null
  prevId: number
  id: number
  requests: {
    name: string
    note: string | null
    amount: number
    id: number
    source: string
    transactionId: number | null
  }[]
  position: number
  donationAmount: number
  songId: number
}
