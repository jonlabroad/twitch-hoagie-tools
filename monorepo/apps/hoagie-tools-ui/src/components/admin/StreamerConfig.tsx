import { FlexCol } from "../util/FlexBox"

interface StreamerConfigProps {
    streamer: string
}

export const StreamerConfig = (props: StreamerConfigProps) => {
    return <>
        <FlexCol>
            <div>{props.streamer}</div>
        </FlexCol>
    </>
}