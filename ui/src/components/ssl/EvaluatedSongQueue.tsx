import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, Typography, Grid, TableBody, Accordion, AccordionSummary, Collapse, LinearProgress, IconButton, AccordionDetails } from "@material-ui/core";
import { useContext, useState } from "react";
import { GeniusLink } from "../links/GeniusLink";
import { SpotifyLink } from "../links/SpotifyLink";
import { StateContext } from "../MainPage";
import { SpotifyEmbed } from "../spotify/SpotifyEmbed";
import { FlexCol, FlexRow } from "../util/FlexBox";
import { SongEvalConfig } from "./SongEvalConfig";
import CheckIcon from '@material-ui/icons/Check';
import BlockIcon from '@material-ui/icons/Block';
const format = require('format-duration')

export interface EvaluatedSongQueueProps {
    config?: SongEvalConfig;
    isLoading: boolean;
    evaluations: Record<string, any>;

    onWordWhitelistChange: (word: string, type: "add" | "remove") => void
}

export const EvaluatedSongQueue = (props: EvaluatedSongQueueProps) => {
    const { evaluations, config } = props;

    const stateContext = useContext(StateContext);
    const { state } = stateContext;

    const [expandedIndex, setExpandedIndex] = useState<number | undefined>(undefined);

    return <Grid item xs={12}><TableContainer component={Paper} className="dono-table-container">
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell><Typography style={{ fontWeight: 600 }}>SSL Song</Typography></TableCell>
                    <TableCell><Typography style={{ fontWeight: 600 }}>User</Typography></TableCell>
                    <TableCell><Typography style={{ fontWeight: 600 }}># Bad Words</Typography></TableCell>
                    <TableCell><Typography style={{ fontWeight: 600 }}>Duration</Typography></TableCell>
                    <TableCell><Typography style={{ fontWeight: 600 }}>Time Signature</Typography></TableCell>
                    <TableCell><Typography style={{ fontWeight: 600 }}>Genres</Typography></TableCell>
                    <TableCell><Typography style={{ fontWeight: 600 }}>Links</Typography></TableCell>
                </TableRow>
                {props.isLoading && <TableRow><TableCell colSpan={7}><LinearProgress /></TableCell></TableRow>}
            </TableHead>
            <TableBody>
                {evaluations.map((evaluation: any, i: number) => {
                    const sslSong = state.songQueue?.list?.[i]?.song;
                    const badWordCounts = getBadWordsCounts(evaluation.eval?.lyricsEval, config?.whitelist ?? []);
                    const totalBadWords = Object.values(badWordCounts).filter(w => !w.isWhitelisted).reduce((prev, curr) => curr.count + prev, 0);
                    const resolvedSong = evaluation.eval?.song;
                    const lyricsLink = resolvedSong?.url;
                    const songName = evaluation.songKey ?? `${sslSong?.artist} - ${sslSong?.title}`;
                    const spotifyInfo = evaluation.songInfo;
                    const songAnalysis = spotifyInfo?.analysis;
                    const spotifyLink = spotifyInfo?.track?.external_urls?.spotify;
                    const durationMs = spotifyInfo?.track?.duration_ms ?? 0;
                    const durationFormatted = format(durationMs);
                    const genres = (evaluation.songInfo?.artist?.genres ?? []) as string[];
                    const timeSignature = songAnalysis?.track?.time_signature;
                    return (
                        <>
                            <TableRow style={{ cursor: "pointer" }} onClick={() => setExpandedIndex(i !== expandedIndex ? i : undefined)}>
                                <TableCell>
                                    <FlexCol>
                                        <Typography>{songName}</Typography>
                                        <Typography style={{ fontSize: 14, color: "grey" }}>{resolvedSong ? `${resolvedSong?.artist_names} - ${resolvedSong?.title} ` : ""}</Typography>
                                    </FlexCol>
                                </TableCell>
                                <TableCell><Typography>{evaluation?.user}</Typography></TableCell>
                                <TableCell><Typography>{evaluation?.eval ? totalBadWords : ""}</Typography></TableCell>
                                <TableCell><Typography>{evaluation?.eval ? durationFormatted : ""}</Typography></TableCell>
                                <TableCell><Typography>{timeSignature ? `${timeSignature}/4 (${songAnalysis?.track?.time_signature_confidence})` : ""}</Typography></TableCell>
                                <TableCell><Typography>{genres.join(", ")}</Typography></TableCell>
                                <TableCell>
                                    <FlexRow>
                                        {lyricsLink && <GeniusLink href={lyricsLink} />}
                                        {spotifyLink && <SpotifyLink href={spotifyLink} />}
                                    </FlexRow>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ backgroundColor: "#eeeeee", paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                    <Collapse in={expandedIndex === i} timeout="auto" unmountOnExit>
                                        <Grid container style={{ marginTop: 10, marginBottom: 10 }}>
                                            <Grid item xs={3}>
                                                <FlexCol>
                                                    <Typography style={{ fontWeight: 600 }}>Bad Words</Typography>
                                                    <Typography>{Object.keys(badWordCounts).filter(w => !badWordCounts[w].isWhitelisted).sort((a, b) => badWordCounts[b]?.count - badWordCounts[a]?.count).map(word => (
                                                        <FlexRow alignItems="center">
                                                            <div style={{ marginRight: 5 }}>{`${word}(${badWordCounts[word].count})`}</div>
                                                            <IconButton onClick={() => props.onWordWhitelistChange(word, "add")}><CheckIcon fontSize="small" color="primary"/></IconButton>
                                                        </FlexRow>
                                                    ))}
                                                    </Typography>
                                                    <Accordion>
                                                        <AccordionSummary>
                                                            <Typography style={{ fontWeight: 600 }} variant="body2">Whitelisted</Typography>
                                                        </AccordionSummary>
                                                        <AccordionDetails>
                                                        <Typography variant="body2">{Object.keys(badWordCounts).filter(w => badWordCounts[w].isWhitelisted).sort((a, b) => badWordCounts[b]?.count - badWordCounts[a]?.count).map(word => (
                                                        <FlexRow alignItems="center">
                                                            <div style={{ marginRight: 5 }}>{`${word}(${badWordCounts[word].count})`}</div>
                                                            <IconButton onClick={() => props.onWordWhitelistChange(word, "remove")}><BlockIcon fontSize="small" color="primary"/></IconButton>
                                                        </FlexRow>
                                                    ))}
                                                    </Typography>
                                                    </AccordionDetails>
                                                    </Accordion>
                                                </FlexCol>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <FlexCol>
                                                    <FlexRow><Typography style={{ fontWeight: 600, marginRight: 10 }}>Resolved Song: </Typography><Typography>{resolvedSong?.full_title}</Typography></FlexRow>
                                                    <FlexRow><Typography style={{ fontWeight: 600, marginRight: 10 }}>Tempo: </Typography><Typography>{songAnalysis?.track?.tempo} ({songAnalysis?.track?.tempo_confidence})</Typography></FlexRow>
                                                </FlexCol>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <SpotifyEmbed
                                                    songId={spotifyInfo?.track?.id}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Collapse>
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