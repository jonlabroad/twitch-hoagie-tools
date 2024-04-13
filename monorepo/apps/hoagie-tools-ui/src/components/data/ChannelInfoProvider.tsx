import { useContext } from "react"
import { useChannelInfo } from "../../hooks/channelInfoHooks"
import { StateContext } from "../context/StateContextProvider"

export const ChannelInfoProvider = () => {
    const stateContext = useContext(StateContext)
    useChannelInfo(stateContext.state?.streamerId, stateContext)

    return <></>
}
