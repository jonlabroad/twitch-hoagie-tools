import { useEffect } from "react";
import { useHoagieSockets } from "../../hooks/hoagieSocketHooks"

export interface HoagieSocketAdminContainerProps {

}

export const HoagieSocketAdminContainer = (props: HoagieSocketAdminContainerProps) => {
    const [hoagieSockets, isHoagieSocketConnected] = useHoagieSockets(() => {}, {
        doSubscribe: false
    })

    useEffect(() => {
        if (hoagieSockets && isHoagieSocketConnected) {
            hoagieSockets.getAllConnections();
        }    
    }, [hoagieSockets, isHoagieSocketConnected])

    return <div>{isHoagieSocketConnected}</div>
}