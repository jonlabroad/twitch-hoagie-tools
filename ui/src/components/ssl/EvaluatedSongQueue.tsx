import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, Typography, Grid, TableBody, LinearProgress, Hidden, useTheme, Tooltip } from "@material-ui/core";
import { useContext, useState } from "react";
import { GeniusLink } from "../links/GeniusLink";
import { SpotifyLink } from "../links/SpotifyLink";
import { StateContext } from "../MainPage";
import { FlexCol, FlexRow } from "../util/FlexBox";
import { SongEvalConfig } from "./SongEvalConfig";
import { EvaluatedSongDetails } from "./EvaluatedSongDetails";
import { Evaluations } from "../../hooks/songQueueEval";
import { DonoData } from "../../service/HoagieClient";
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';

const format = require('format-duration')

export interface EvaluatedSongQueueProps {
    config?: SongEvalConfig;
    isLoading: boolean;
    evaluations: Evaluations;
    donoData?: DonoData[]

    onWordWhitelistChange: (word: string, type: "add" | "remove") => void
}

const headerStyle = {
    fontWeight: 600
}

const DonoIcon = (props: { donoData: DonoData }) => {
    return <Tooltip title={`\$${props.donoData?.value}`}><div style={{ height: 30, width: 30, color: "gold" }}><MonetizationOnIcon /></div></Tooltip>
}

export const EvaluatedSongQueue = (props: EvaluatedSongQueueProps) => {
    const { evaluations, config, donoData } = props;

    const stateContext = useContext(StateContext);
    const { state } = stateContext;

    const [expandedIndex, setExpandedIndex] = useState<number | undefined>(undefined);

    const songQueue = state.songQueue?.list ?? [];

    return <Grid item xs={12}><TableContainer component={Paper} className="dono-table-container">
        <Table size="small">
            <TableHead>
                <TableRow >
                    <Hidden smDown><TableCell><Typography style={headerStyle}>Queue Pos</Typography></TableCell></Hidden>
                    <TableCell><Typography style={headerStyle}>SSL Song</Typography></TableCell>
                    <Hidden smDown><TableCell><Typography style={headerStyle}>User</Typography></TableCell></Hidden>
                    <TableCell><Typography style={headerStyle}># Bad Words</Typography></TableCell>
                    <TableCell><Typography style={headerStyle}>Duration</Typography></TableCell>
                    <Hidden smDown><TableCell><Typography style={headerStyle}>Time Signature</Typography></TableCell></Hidden>
                    <TableCell><Typography style={headerStyle}>Genres</Typography></TableCell>
                    <TableCell><Typography style={headerStyle}>Links</Typography></TableCell>
                </TableRow>
                {props.isLoading && <TableRow><TableCell colSpan={7}><LinearProgress /></TableCell></TableRow>}
            </TableHead>
            <TableBody>
                {songQueue?.map((queueSong: any, i: number) => {
                    const sslListSong = queueSong?.song;
                    const nonListSong = queueSong?.nonlistSong;
                    const songKey = nonListSong ?? `${sslListSong?.artist?.trim()} - ${sslListSong?.title?.trim()}`;
                    const evaluation = evaluations[songKey] as any | undefined;
                    const badWordStatus = evaluation?.eval?.lyricsEval?.status
                    const badWordCounts = getBadWordsCounts(evaluation?.eval?.lyricsEval, config?.whitelist ?? []);
                    const totalBadWords = !badWordStatus?.isError ? Object.values(badWordCounts).filter(w => !w.isWhitelisted).reduce((prev, curr) => curr.count + prev, 0) : "X";
                    const resolvedSong = evaluation?.eval?.song;
                    const lyricsLink = resolvedSong?.url;
                    const spotifyInfo = evaluation?.songInfo;
                    const songAnalysis = spotifyInfo?.analysis;
                    const spotifyLink = spotifyInfo?.track?.external_urls?.spotify;
                    const durationMs = spotifyInfo?.track?.duration_ms ?? 0;
                    const durationFormatted = format(durationMs);
                    const genres = (evaluation?.songInfo?.artist?.genres ?? []) as string[];
                    const timeSignature = songAnalysis?.track?.time_signature;
                    const timeSignatureText = timeSignature ? `${timeSignature}/4` : "";
                    const timeSignatureConfidenceText = timeSignature ? `(${songAnalysis?.track?.time_signature_confidence})` : "";
                    const genreText = genres.join(", ");
                    const userDonoData = evaluation?.user ? donoData?.find(d => d.SubKey.toLowerCase() === evaluation?.user?.toLowerCase()) : undefined
                    return (
                        <>
                            <TableRow style={{ cursor: "pointer" }} onClick={() => setExpandedIndex(i !== expandedIndex ? i : undefined)}>
                                <Hidden smDown><TableCell width={1}>{i + 1}</TableCell></Hidden>
                                <TableCell>
                                    <FlexCol>
                                        <Typography>{songKey}</Typography>
                                        <Typography style={{ fontSize: 14, color: "grey" }}>
                                            {resolvedSong ? `${resolvedSong?.artist_names} - ${resolvedSong?.title}` : ""}
                                        </Typography>
                                    </FlexCol>
                                </TableCell>
                                <Hidden smDown>
                                    <TableCell>
                                        <FlexRow>{userDonoData ? <DonoIcon donoData={userDonoData}/> : ""}<Typography>{evaluation?.user}</Typography></FlexRow>
                                    </TableCell>
                                </Hidden>
                                <TableCell>
                                    <Tooltip title={badWordStatus?.statusMessage}><Typography>{evaluation?.eval ? totalBadWords : ""}</Typography></Tooltip>
                                </TableCell>
                                <TableCell>
                                    <Typography>{evaluation?.eval ? durationFormatted : ""}</Typography>
                                </TableCell>
                                <Hidden smDown>
                                    <TableCell>
                                        <FlexRow alignItems="center" mr={3}>
                                            <Typography>{timeSignatureText}&nbsp;</Typography>
                                            <Typography variant="body2" color="textSecondary">{timeSignatureConfidenceText}</Typography>
                                        </FlexRow>
                                    </TableCell>
                                </Hidden>
                                <TableCell>
                                    <Typography>{genreText}</Typography>
                                </TableCell>
                                <TableCell>
                                    <FlexRow>
                                        {lyricsLink && <GeniusLink href={lyricsLink} />}
                                        {spotifyLink && <SpotifyLink href={spotifyLink} />}
                                    </FlexRow>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                    <EvaluatedSongDetails
                                        expanded={expandedIndex === i}
                                        badWordCounts={badWordCounts}
                                        badWordStatus={badWordStatus}
                                        spotifyInfo={spotifyInfo}
                                        resolvedSong={resolvedSong}
                                        songAnalysis={songAnalysis}

                                        onWordWhitelistChange={props.onWordWhitelistChange}
                                    />
                                </TableCell>
                            </TableRow>
                        </>
                    )
                })}
            </TableBody>
        </Table>
    </TableContainer>
    </Grid>
}

function getBadWordsCounts(lyricsEval: any, whitelist: string[]): Record<string, { count: number, isWhitelisted: boolean }> {
    const badWordCounts: Record<string, { count: number, isWhitelisted: boolean }> = {};
    lyricsEval?.bad_words_list?.forEach((badWord: any) => {
        const word = badWord.original.toLowerCase();
        badWordCounts[word] = {
            count: (badWordCounts[word]?.count ?? 0) + 1,
            isWhitelisted: whitelist.map(w => w.toLowerCase()).includes(word.toLowerCase())
        }
    });
    return badWordCounts;
}