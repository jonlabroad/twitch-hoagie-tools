import { Tooltip, Typography } from "@mui/material"
import { FlexCol, FlexRow } from "../util/FlexBox"
import { RaidEvent } from "./RaidEvent"

export interface RaidHistoryProps {
    raidsIn: RaidEvent[]
    raidsOut: RaidEvent[]
}

function toDaysAgo(t1: number) {
    const days1 = t1 / 1000 / 60 / 60 / 24;
    const days2 = new Date().getTime() / 1000 / 60 / 60 / 24;
    return Math.round(days2 - days1);
}

const RaidInfo = (props: {
    timestamp: number
    viewers: number
}) => {
    const date = new Date(props.timestamp);
    const daysAgo = toDaysAgo(props.timestamp);
    return (
        <FlexRow justifyContent="space-between">
            <Tooltip title={date.toLocaleString()}>
                <Typography style={{ fontSize: 14, marginRight: 5 }}>{daysAgo} days</Typography>
            </Tooltip>
            <Typography style={{ fontSize: 12 }}>{props.viewers}</Typography>
        </FlexRow>
    )
}

export const RaidHistory = (props: RaidHistoryProps) => {
    const { raidsIn, raidsOut } = props;

    const sortedRaidsIn = raidsIn.sort((r1, r2) => r2.timestamp - r1.timestamp);
    const sortedRaidsOut = raidsOut.sort((r1, r2) => r2.timestamp - r1.timestamp);

    return <FlexCol>
        {sortedRaidsIn.length > 0 && <Typography style={{fontSize: 14, fontWeight: "bold"}}>In ({raidsIn.length})</Typography>}
        {sortedRaidsIn.map(raid => (
            <RaidInfo timestamp={raid.timestamp} viewers={raid.viewers} />
        ))}
        <div style={{marginBottom: 10}}></div>
        {sortedRaidsOut.length > 0 && <Typography style={{fontSize: 14, fontWeight: "bold"}}>Out ({raidsOut.length})</Typography>}
        {sortedRaidsOut.map(raid => (
            <RaidInfo timestamp={raid.timestamp} viewers={raid.viewers} />
        ))}
    </FlexCol>
}