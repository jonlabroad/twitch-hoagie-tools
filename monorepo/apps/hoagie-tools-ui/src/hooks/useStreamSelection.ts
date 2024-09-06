import { useState, useEffect, useContext } from "react"
import { StreamInfo } from "../components/dono/DonoTableContainer"
import { AppState } from "../state/AppState"
import { LoginContext } from "../components/context/LoginContextProvider";
import { StateContext } from "../components/context/StateContextProvider";

// Move this or something
function getStreamGroups(streamHistory: StreamInfo[]) {
    const newHistory: StreamInfo[][] = [];
    let remainingHistory = streamHistory.slice()
    let currentStream = remainingHistory[0]
    while (currentStream && remainingHistory.length > 0) {
        const newGroup: StreamInfo[] = []
        newHistory.push(newGroup)
        const currentStreamTime = new Date(currentStream.timestamp).getTime()
        const closeStreams = remainingHistory.filter(s => {
            if (!s.streamId || !s.timestamp) {
                return false
            }
            const otherStreamTime = new Date(s.timestamp).getTime()
            return Math.abs(currentStreamTime - otherStreamTime) < 9 * 60 * 60 * 1e3
        })
        newGroup.push(...closeStreams)
        remainingHistory = remainingHistory.slice(newGroup.length)

        if (closeStreams.length <= 0) {
            break
        }

        currentStream = remainingHistory[0]
    }

    return newHistory;
}

export function useStreamSelection(streamHistory: StreamInfo[] | undefined): [StreamInfo[], (dir: number) => any, boolean, boolean] {
    const [currentStreams, setCurrentStreams] = useState<StreamInfo[] | undefined>(undefined)
    const { state } = useContext(StateContext)
    const { state: loginState } = useContext(LoginContext)

    useEffect(() => {
        async function getStreamHistory() {
            if (loginState.username && loginState.accessToken && state.streamer) {
                if (streamHistory) {
                    const groups = getStreamGroups(streamHistory ?? [])
                    setCurrentStreams(groups[0])
                }
            }
        }
        getStreamHistory()
    }, [streamHistory])

    const streamHistoryGrouped = getStreamGroups(streamHistory ?? [])
    const currentStreamIds = currentStreams?.map((currentStream => currentStream.streamId)) ?? []
    const currentStreamIndex = (streamHistoryGrouped ?? []).findIndex(sh => !!sh[0] && currentStreamIds[0] === sh[0].streamId)

    const getNextStream = (direction: number) => {
        const nextStream = streamHistoryGrouped?.[(currentStreamIndex ?? 1000000) + direction]
        if (nextStream) {
            setCurrentStreams(nextStream)
        }
    }

    const historyLength = streamHistory?.length ?? 0
    return [currentStreams ?? [], getNextStream, currentStreamIndex === historyLength - 1, currentStreamIndex === 0]
}
