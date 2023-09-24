import { Table, TableHead, TableRow, TableCell, TableBody, Card, TableContainer, Paper, Typography, styled, Chip, Tooltip, useTheme, Hidden } from "@mui/material"
import { UserDonoSummary } from "../../service/HoagieClient";
import { GetHistoryResponse, GetQueueResponse } from "../../service/StreamerSongListClient";

import "../../styles/Dono.scss";
import { FlexRow } from "../util/FlexBox";

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
                        <TableCell><Typography style={{...tableHeaderStyle, width: "20%"}}>Username</Typography></TableCell>
                        <TableCell><Typography style={{...tableHeaderStyle, width: "5%"}}>Value</Typography></TableCell>
                        <Hidden mdDown><TableCell><Typography style={{...tableHeaderStyle, width: "5%"}}>Dono</Typography></TableCell></Hidden>
                        <Hidden mdDown><TableCell><Typography style={{...tableHeaderStyle, width: "5%"}}>Cheer</Typography></TableCell></Hidden>
                        <Hidden mdDown><TableCell><Typography style={{...tableHeaderStyle, width: "5%"}}>Sub</Typography></TableCell></Hidden>
                        <Hidden mdDown><TableCell><Typography style={{...tableHeaderStyle, width: "5%"}}>Gifted Subs</Typography></TableCell></Hidden>
                        <Hidden mdDown><TableCell><Typography style={{...tableHeaderStyle, width: "5%"}}>Hype Chat</Typography></TableCell></Hidden>
                        <TableCell><Typography style={{...tableHeaderStyle, width: "55%"}}>Requests</Typography></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {eligibleDonoData?.map(userdata => (
                        <DonoTableRow userdata={userdata} songQueue={songQueue} songHistory={songHistory} />
                    ))}
                    <TableRow style={{ backgroundColor: theme.palette.secondary.dark}}><TableCell colSpan={8} style={{ height: 20 }}></TableCell></TableRow>
                    {notEligibleDonoData?.map(userdata => (
                        <DonoTableRow userdata={userdata} />
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
            <TableCell>{userdata.username}</TableCell>
            <TableCell align="right" style={{width: "5%"}}>${Math.round(userdata.value * 100) / 100}</TableCell>
            <Hidden mdDown><TableCell align="right" style={{width: "5%"}}>{userdata.dono ? Math.round(userdata.dono * 100) / 100 : ""}</TableCell></Hidden>
            <Hidden mdDown><TableCell align="right" style={{width: "5%"}}>{userdata.bits}</TableCell></Hidden>
            <Hidden mdDown><TableCell align="right" style={{width: "5%"}}>{userdata.subs}</TableCell></Hidden>
            <Hidden mdDown><TableCell align="right" style={{width: "5%"}}>{userdata.subgifts}</TableCell></Hidden>
            <Hidden mdDown><TableCell align="right" style={{width: "5%"}}>{userdata.hypechat}</TableCell></Hidden>
            <TableCell align="left" style={{...tableHeaderStyle, width: "55%"}}>
                <FlexRow>
                    {queueSongTitles?.map(s => <Tooltip title={s}>
                        <Chip style={{marginRight: 5}} label={"In Queue"} color="secondary" />
                    </Tooltip>)}
                    {historySongTitles?.map(s => <Tooltip title={s}>
                        <Chip label={"Completed"} color="primary" />
                    </Tooltip>)}
                </FlexRow>
            </TableCell>
        </StyledTableRow>
    </>;
}
