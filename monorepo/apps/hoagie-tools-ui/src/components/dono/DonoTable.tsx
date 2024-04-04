import { Table, TableHead, TableRow, TableCell, TableBody, Card, TableContainer, Paper, Typography, styled, Chip, Tooltip, useTheme, Hidden } from "@mui/material"
import { GetHistoryResponse, GetQueueResponse } from "../../service/StreamerSongListClient";

import "../../styles/Dono.scss";
import { FlexRow } from "../util/FlexBox";
import { TwitchBitIcon } from "../icon/TwitchBitIcon";
import { TwitchSubIcon } from "../icon/TwitchSubIcon";
import { TwitchGiftSubIcon } from "../icon/TwitchGiftSubIcon";
import { TwitchPrimeSubIcon } from "../icon/TwitchPrimeSubIcon";
import { MoneyIcon } from "../icon/MoneyIcon";
import { UserDonoSummary } from "@hoagie/dono-service";
import { UserData } from "@hoagie/service-clients";
import { TwitchAvatar } from "../avatar/TwitchAvatar";
import { useMemo } from "react";

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
    twitchUserData: Record<string, UserData>;
}

export const DonoTable = (props: DonoTableProps) => {
    const { eligibleDonoData, notEligibleDonoData, songQueue, songHistory, twitchUserData } = props;

    const theme = useTheme();

    return (
      useMemo(() => (
        <TableContainer component={Paper} className="dono-table-container">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell><Typography style={{...tableHeaderStyle, width: "10%"}}>User</Typography></TableCell>
                        <TableCell align="right"><Typography style={{...tableHeaderStyle, width: "5%"}}>Total</Typography></TableCell>
                        <TableCell><Typography style={{...tableHeaderStyle, width: "15%"}}>Support</Typography></TableCell>
                        <Hidden xsDown><TableCell><Typography style={{...tableHeaderStyle}}>Requests</Typography></TableCell></Hidden>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {eligibleDonoData?.map(userdata => (
                        <DonoTableRow
                          key={userdata.username}
                          userdata={userdata}
                          songQueue={songQueue}
                          songHistory={songHistory}
                          twitchUserData={twitchUserData?.[userdata.username.toLowerCase()]}
                        />
                    ))}
                    <TableRow style={{ backgroundColor: theme.palette.secondary.dark}}><TableCell colSpan={8} style={{ height: 20 }}></TableCell></TableRow>
                    {notEligibleDonoData?.map(userdata => (
                        <DonoTableRow
                          key={userdata.username}
                          userdata={userdata}
                          twitchUserData={twitchUserData?.[userdata.username.toLowerCase()]}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
      ), [eligibleDonoData, notEligibleDonoData, songQueue, songHistory, twitchUserData, theme])
    );
}

interface DonoTableRowProps {
    userdata: UserDonoSummary
    songQueue?: GetQueueResponse
    songHistory?: GetHistoryResponse
    twitchUserData?: UserData
}

const DonoTableRow = (props: DonoTableRowProps) => {
    const { userdata, songQueue, songHistory, twitchUserData } = props;

    const queueSongs = songQueue?.list.filter(song => song.requests.filter(r => r.name.toLowerCase().trim() === userdata.username.toLowerCase()).length > 0);
    const historySongs = songHistory?.items.filter(song => song.requests.filter(r => r.name.toLowerCase().trim() === userdata.username.toLowerCase()).length > 0);

    const queueSongTitles = queueSongs?.map(s => s?.song ? `${s?.song?.title} - ${s?.song?.artist}` : `${s?.nonlistSong ?? ""}`)
    const historySongTitles = historySongs?.map(s => s?.song ? `${s?.song?.title} - ${s?.song?.artist}` : `${s?.nonlistSong ?? ""}`)

    return <>
        <StyledTableRow>
            <TableCell style={{ width: "5%" }}>
              <FlexRow alignItems="center">
                <span style={{ marginRight: 5 }}>
                  <TwitchAvatar username={twitchUserData?.login ?? userdata.username} avatarImageUrl={twitchUserData?.profile_image_url} />
                </span>
                <div>{userdata.username}</div>
              </FlexRow>
            </TableCell>
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
            <Hidden xsDown><TableCell align="left" style={{...tableHeaderStyle}}>
                <FlexRow>
                    {queueSongTitles?.map(s => <Tooltip title={s}>
                        <Chip key={s} style={{marginRight: 5}} label={"Queued"} color="secondary" size="small" />
                    </Tooltip>)}
                    {historySongTitles?.map(s => <Tooltip title={s}>
                        <Chip key={s} label={"Complete"} color="primary" size="small" />
                    </Tooltip>)}
                </FlexRow>
            </TableCell>
            </Hidden>
        </StyledTableRow>
    </>;
}
