import { FlexRow } from "../util/FlexBox"

export const GeniusLink = (props: {
    href: string
}) => (
    <a style={{ marginRight: 10}} href={props.href} target="_blank">
        <FlexRow alignItems="center">
            <div style={{ height: 25 }}>
                <img style={{ height: 25 }} src="/geniuslogo.png" />
            </div>
        </FlexRow>
    </a>
)