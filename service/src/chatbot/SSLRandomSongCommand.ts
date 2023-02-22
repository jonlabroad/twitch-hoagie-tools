import StreamerSongListClient, { GetQueueResponse, SongListSong } from "../StreamerSongList/StreamerSongListClient";
import { CommandResult } from "./ChatCommandProcessor";

export interface SSLParamsBase {
    token: string
    streamerName: string
}

export interface SSLRandomSongCommandParams extends SSLParamsBase {
    bumpSong: boolean
    ignoreFirst: boolean
    songListOnly: boolean
    tagUser: boolean
    inChatOnly: boolean
}

export class SSLRandomSongCommand {
    static parseParams(params: Record<string, string>) {
        const parsed: SSLRandomSongCommandParams = {
            token: params.accesstoken,
            streamerName: params.streamername,
            bumpSong: params.bumpsong?.toLowerCase() === "true",
            ignoreFirst: params.ignorefirst?.toLowerCase() === "true",
            songListOnly: params.songlistonly?.toLowerCase() === "true",
            tagUser: params.taguser?.toLowerCase() === "true",
            inChatOnly: params.inchatonly?.toLowerCase() === "true"
        }
        return parsed;
    }

    static async process(params: Record<string, string>): Promise<CommandResult> {
        try {
            const config = this.parseParams(params)
            console.log({ config })
            const sslClient = new StreamerSongListClient(config.token)
            const streamerId = await sslClient.getStreamerId(config.streamerName)
            const sslQueue = await sslClient.getQueue(streamerId)

            const validSongs = sslQueue.list.map((slSong, slIndex) => ({ slSong, slIndex }))
                .filter((slsong, i) => this.isValidIndex(i, sslQueue, config))

            if (validSongs.length <= 0) {
                throw new Error("No valid songs to bump!")
            }

            const randomIndex = Math.floor(Math.random() * validSongs.length)
            const songToBump = sslQueue.list[validSongs[randomIndex]?.slIndex]
            if (!songToBump) {
                throw new Error("Error finding song to bump!")
            }

            return {
                message: this.getSetSongCommand(songToBump)
            }
        } catch (err) {
            console.error(err)
            return {
                message: `Error finding a song to bump MrDestructoid`
            }
        }
    }

    static getSetSongCommand(songToBump: SongListSong) {
        return `!setsong ${this.getSongName(songToBump)} to 1`
    }

    static getBumpMessage(songToBump: SongListSong, tagUser: boolean) {
        const songName = this.getSongName(songToBump)
        const requester = this.getRequester(songToBump)

        if (requester && tagUser) {
            return `@${requester} ${songName}`
        }

        return `${songName}`
    }

    static getSongName(song: SongListSong) {
        if (song.nonlistSong) {
            return song.nonlistSong;
        }

        return `${song.song.title} - ${song.song.artist}`
    }

    static getRequester(song: SongListSong) {
        return song.requests[0]?.name ?? ""
    }

    static isValidIndex(index: number, queue: GetQueueResponse, config: SSLRandomSongCommandParams) {
        if (config.ignoreFirst && index === 0) {
            return false;
        }

        if (index < 0 || index >= queue.list.length) {
            return false;
        }

        const song = queue.list[index]

        if (!song) {
            return false;
        }

        if (config.songListOnly && !!song.nonlistSong) {
            return false;
        }

        if (song.nonlistSong && song.nonlistSong.length <= 5) {
            return false;
        }

        //if (song.requests?.[0]. config.inChatOnly)

        return true;
    }
}