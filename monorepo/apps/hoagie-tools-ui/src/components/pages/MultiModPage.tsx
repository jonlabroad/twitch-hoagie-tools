import Button from "@mui/material/Button"
import { FlexCol, FlexRow } from "../util/FlexBox"
import { useGoogleLogin } from "@react-oauth/google"

interface IProps {}

export const MultiModPage = (props: IProps) => {

    const login = useGoogleLogin({
        flow: "implicit",
        scope: "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl",
        onSuccess: (tokenResponse) => console.log(tokenResponse),
        onError: (error) => console.log("Login Failed:", error),
    });

    return (
            <FlexCol>
                <div>Multi Mod Page</div>
                <FlexRow>
                    <Button onClick={() => login()}>Login</Button>
                </FlexRow>
            </FlexCol>
    )
}