import { Table, TableHead, TableRow, TableCell, TableBody, Card, TableContainer, Paper, Typography, styled, Chip, Tooltip, useTheme, Hidden } from "@mui/material"
import { UserDonoSummary } from "../../service/HoagieClient";
import { GetHistoryResponse, GetQueueResponse } from "../../service/StreamerSongListClient";

import "../../styles/Dono.scss";
import { FlexRow } from "../util/FlexBox";
import { TwitchBitIcon } from "../icon/TwitchBitIcon";
import { TwitchSubIcon } from "../icon/TwitchSubIcon";
import { TwitchGiftSubIcon } from "../icon/TwitchGiftSubIcon";
import { TwitchPrimeSubIcon } from "../icon/TwitchPrimeSubIcon";
import { MoneyIcon } from "../icon/MoneyIcon";

const tableHeaderStyle = {
    fontWeight: 600
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover
    },
}));

interface DonoTableProps {
    eligibleDonoData: UserDonoSummary[];
    notEligibleDonoData: UserDonoSummary[];
    songQueue?: GetQueueResponse
    songHistory?: GetHistoryResponse
}

export const DonoTable = (props: DonoTableProps) => {
    const { eligibleDonoData, notEligibleDonoData, songQueue, songHistory } = props;

    const theme = useTheme();

    return (
        <TableContainer component={Paper} className="dono-table-container">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell><Typography style={{...tableHeaderStyle, width: "10%"}}>Username</Typography></TableCell>
                        <TableCell align="right"><Typography style={{...tableHeaderStyle, width: "5%"}}>Value</Typography></TableCell>
                        <TableCell><Typography style={{...tableHeaderStyle, width: "15%"}}>Support</Typography></TableCell>
                        <Hidden mdDown><TableCell><Typography style={{...tableHeaderStyle}}>Requests</Typography></TableCell></Hidden>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {eligibleDonoData?.map(userdata => (
                        <DonoTableRow key={userdata.username} userdata={userdata} songQueue={songQueue} songHistory={songHistory} />
                    ))}
                    <TableRow style={{ backgroundColor: theme.palette.secondary.dark}}><TableCell colSpan={8} style={{ height: 20 }}></TableCell></TableRow>
                    {notEligibleDonoData?.map(userdata => (
                        <DonoTableRow key={userdata.username} userdata={userdata} />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

interface DonoTableRowProps {
    userdata: UserDonoSummary
    songQueue?: GetQueueResponse
    songHistory?: GetHistoryResponse
}

const DonoTableRow = (props: DonoTableRowProps) => {
    const { userdata, songQueue, songHistory } = props;

    const queueSongs = songQueue?.list.filter(song => song.requests.filter(r => r.name.toLowerCase().trim() === userdata.username.toLowerCase()).length > 0);
    const historySongs = songHistory?.items.filter(song => song.requests.filter(r => r.name.toLowerCase().trim() === userdata.username.toLowerCase()).length > 0);

    const queueSongTitles = queueSongs?.map(s => s?.song ? `${s?.song?.title} - ${s?.song?.artist}` : `${s?.nonlistSong ?? ""}`)
    const historySongTitles = historySongs?.map(s => s?.song ? `${s?.song?.title} - ${s?.song?.artist}` : `${s?.nonlistSong ?? ""}`)

    return <>
        <StyledTableRow>
            <TableCell style={{ width: "5%" }}>{userdata.username}</TableCell>
            <TableCell align="right" style={{width: "5%"}}>${Math.round(userdata.value * 100) / 100}</TableCell>
            <Hidden xsDown><TableCell align="right" style={{width: "15%"}}>
                <FlexRow alignItems="center">
                    {!!userdata.subs && (<FlexRow marginRight={1}><TwitchSubIcon tier={userdata.subtier}/><TwitchPrimeSubIcon tier={userdata.subtier}/></FlexRow>)}
                    {!!userdata.bits && <FlexRow alignItems="center" marginRight={1}>
                        <TwitchBitIcon />{userdata.bits}
                    </FlexRow>}
                    {!!userdata.subgifts && (
                    <FlexRow alignItems="center" marginRight={1}>
                        <TwitchGiftSubIcon />{userdata.subgifts}
                    </FlexRow>
                    )}
                    {!!userdata.dono && <FlexRow alignItems="center" marginRight={1}><MoneyIcon />{`${userdata.dono}`}</FlexRow>}
                </FlexRow>
            {!!userdata.hypechat && `Hypechat ${userdata.hypechat}`}
            </TableCell></Hidden>
            <Hidden mdDown><TableCell align="left" style={{...tableHeaderStyle}}>
                <FlexRow>
                    {queueSongTitles?.map(s => <Tooltip title={s}>
                        <Chip key={s} style={{marginRight: 5}} label={"In Queue"} color="secondary" />
                    </Tooltip>)}
                    {historySongTitles?.map(s => <Tooltip title={s}>
                        <Chip key={s} label={"Completed"} color="primary" />
                    </Tooltip>)}
                </FlexRow>
            </TableCell>
            </Hidden>
        </StyledTableRow>
    </>;
}
