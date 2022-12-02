import { Table, TableHead, TableRow, TableCell, TableBody, Card, TableContainer, Paper, Typography, styled, Chip, Tooltip } from "@material-ui/core"
import { DonoData } from "../../service/HoagieClient";
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
    eligibleDonoData: DonoData[];
    notEligibleDonoData: DonoData[];
    songQueue?: GetQueueResponse
    songHistory?: GetHistoryResponse
}

export const DonoTable = (props: DonoTableProps) => {
    const { eligibleDonoData, notEligibleDonoData, songQueue, songHistory } = props;

    return (
        <TableContainer component={Paper} className="dono-table-container">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell><Typography style={{...tableHeaderStyle, width: "20%"}}>Username</Typography></TableCell>
                        <TableCell><Typography style={{...tableHeaderStyle, width: "5%"}}>Dono</Typography></TableCell>
                        <TableCell><Typography style={{...tableHeaderStyle, width: "5%"}}>Cheer</Typography></TableCell>
                        <TableCell><Typography style={{...tableHeaderStyle, width: "5%"}}>Sub</Typography></TableCell>
                        <TableCell><Typography style={{...tableHeaderStyle, width: "5%"}}>Gifted Subs</Typography></TableCell>
                        <TableCell><Typography style={{...tableHeaderStyle, width: "5%"}}>Value</Typography></TableCell>
                        <TableCell><Typography style={{...tableHeaderStyle, width: "55%"}}>Requests</Typography></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {eligibleDonoData?.map(userdata => (
                        <DonoTableRow userdata={userdata} songQueue={songQueue} songHistory={songHistory} />
                    ))}
                    <TableRow><TableCell colSpan={7} style={{ height: 20 }}></TableCell></TableRow>
                    {notEligibleDonoData?.map(userdata => (
                        <DonoTableRow userdata={userdata} />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

interface DonoTableRowProps {
    userdata: DonoData
    songQueue?: GetQueueResponse
    songHistory?: GetHistoryResponse
}

const DonoTableRow = (props: DonoTableRowProps) => {
    const { userdata, songQueue, songHistory } = props;

    const queueSongs = songQueue?.list.filter(song => song.requests.filter(r => r.name.toLowerCase().trim() === userdata.SubKey.toLowerCase()).length > 0);
    const historySongs = songHistory?.items.filter(song => song.requests.filter(r => r.name.toLowerCase().trim() === userdata.SubKey.toLowerCase()).length > 0);

    const queueSongTitles = queueSongs?.map(s => s?.song ? `${s?.song?.title} - ${s?.song?.artist}` : `${s?.nonlistSong ?? ""}`)
    const historySongTitles = historySongs?.map(s => s?.song ? `${s?.song?.title} - ${s?.song?.artist}` : `${s?.nonlistSong ?? ""}`)

    return <>
        <StyledTableRow>
            <TableCell style={{width: "20%"}}>{userdata.SubKey}</TableCell>
            <TableCell align="right" style={{width: "5%"}}>{userdata.dono ? Math.round(userdata.dono * 100) / 100 : ""}</TableCell>
            <TableCell align="right" style={{width: "5%"}}>{userdata.cheer}</TableCell>
            <TableCell align="right" style={{width: "5%"}}>{userdata.sub}</TableCell>
            <TableCell align="right" style={{width: "5%"}}>{userdata.subgift}</TableCell>
            <TableCell align="right" style={{width: "5%"}}>${Math.round(userdata.value * 100) / 100}</TableCell>
            <TableCell align="left" style={{...tableHeaderStyle, width: "55%"}}>
                <FlexRow>
                    {queueSongTitles?.map(s => <Tooltip title={s}>
                        <Chip style={{marginRight: 5}} label={"In Queue"} color="primary" variant="outlined" />
                    </Tooltip>)}
                    {historySongTitles?.map(s => <Tooltip title={s}>
                        <Chip label={"Completed"} color="primary" />
                    </Tooltip>)}
                </FlexRow>
            </TableCell>
        </StyledTableRow>
    </>
}
