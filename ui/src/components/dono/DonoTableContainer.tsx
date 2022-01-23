import { useContext, useEffect, useState } from "react";
import HoagieClient, { DonoData } from "../../service/HoagieClient";
import { StateContext } from "../MainPage";
import { DonoTable } from "./DonoTable";

interface DonoTableContainerProps {

}

export const DonoTableContainer = (props: DonoTableContainerProps) => {
    const { state } = useContext(StateContext);

    const [donoData, setDonoData] = useState<DonoData[]>([]);

    useEffect(() => {
        async function get() {
            console.log({ state });
            if (state.username && state.accessToken && state.streamer) {
                const client = new HoagieClient();
                const data = await client.getDonos(state.username, state.accessToken, state.streamer)
                setDonoData(data.donos ?? []);
            }
        }
        get();
    }, [state.username, state.accessToken, state.streamer])

    const isLoggedIn = state.isLoggedIn && state.accessToken && state.username;

    return <>
        {!isLoggedIn && <LoginPrompt />}
        {isLoggedIn && <DonoTable
            donoData={donoData}
        />}
    </>
}

const LoginPrompt = () => <div>Login to view dono table</div>