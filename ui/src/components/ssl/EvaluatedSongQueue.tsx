import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, Typography, Grid, TableBody, Accordion, AccordionSummary, Collapse, LinearProgress } from "@material-ui/core";
import { useContext, useState } from "react";
import { GeniusLink } from "../links/GeniusLink";
import { SpotifyLink } from "../links/SpotifyLink";
import { StateContext } from "../MainPage";
import { SpotifyEmbed } from "../spotify/SpotifyEmbed";
import { FlexCol, FlexRow } from "../util/FlexBox";
const format = require('format-duration')

export interface EvaluatedSongQueueProps {
    isLoading: boolean;
    evaluations: Record<string, any>;
}

export const EvaluatedSongQueue = (props: EvaluatedSongQueueProps) => {
    const { evaluations } = props;

    const stateContext = useContext(StateContext);
    const { state } = stateContext;

    const [expandedIndex, setExpandedIndex] = useState<number | undefined>(undefined);

    return <Grid item xs={12}><TableContainer component={Paper} className="dono-table-container">
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell><Typography style={{fontWeight: 600}}>SSL Song</Typography></TableCell>
                    <TableCell><Typography style={{fontWeight: 600}}>User</Typography></TableCell>
                    <TableCell><Typography style={{fontWeight: 600}}># Bad Words</Typography></TableCell>
                    <TableCell><Typography style={{fontWeight: 600}}>Duration</Typography></TableCell>
                    <TableCell><Typography style={{fontWeight: 600}}>Time Signature</Typography></TableCell>
                    <TableCell><Typography style={{fontWeight: 600}}>Genres</Typography></TableCell>
                    <TableCell><Typography style={{fontWeight: 600}}>Links</Typography></TableCell>
                </TableRow>
                {props.isLoading && <TableRow><TableCell colSpan={7}><LinearProgress /></TableCell></TableRow>}
            </TableHead>
            <TableBody>
                {evaluations.map((evaluation: any, i: number) => {
                    const badWordCounts = getBadWordsCounts(evaluation.eval?.lyricsEval);
                    const totalBadWords = Object.values(badWordCounts).reduce((prev, curr) => curr + prev, 0);
                    const resolvedSong = evaluation.eval?.song;
                    const lyricsLink = resolvedSong?.url;
                    const songName = evaluation.songKey;
                    const spotifyInfo = evaluation.songInfo;
                    const songAnalysis = spotifyInfo?.analysis;
                    const spotifyLink = spotifyInfo?.track?.external_urls?.spotify;
                    const durationMs = spotifyInfo?.track?.duration_ms ?? 0;
                    const durationFormatted = format(durationMs);
                    const genres = (evaluation.songInfo?.artist?.genres ?? []) as string[];
                    return (
                        <>
                            <TableRow style={{ cursor: "pointer" }} onClick={() => setExpandedIndex(i !== expandedIndex ? i : undefined)}>
                                <TableCell>
                                    <FlexCol>
                                        <Typography>{songName}</Typography>
                                        <Typography style={{ fontSize: 14, color: "grey"}}>{resolvedSong ? `${resolvedSong?.artist_names} - ${resolvedSong?.title} ` : ""}</Typography>
                                    </FlexCol>
                                </TableCell>
                                <TableCell><Typography>{evaluation?.user}</Typography></TableCell>
                                <TableCell><Typography>{totalBadWords}</Typography></TableCell>
                                <TableCell><Typography>{durationFormatted}</Typography></TableCell>
                                <TableCell><Typography>{songAnalysis?.track?.time_signature}/4 ({songAnalysis?.track?.time_signature_confidence})</Typography></TableCell>
                                <TableCell><Typography>{genres.join(", ")}</Typography></TableCell>
                                <TableCell>
                                    <FlexRow>
                                        {lyricsLink && <GeniusLink href={lyricsLink}/>}
                                        {spotifyLink && <SpotifyLink href={spotifyLink} />}
                                    </FlexRow>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ backgroundColor: "#eeeeee", paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                    <Collapse in={expandedIndex === i} timeout="auto" unmountOnExit>
                                        <Grid container style={{ marginTop: 10, marginBottom: 10 }}>
                                            <Grid item xs={3}>
                                                <FlexCol>
                                                    <Typography style={{fontWeight: 600}}>Bad Words</Typography>
                                                    <Typography>{Object.keys(badWordCounts).sort((a, b) => badWordCounts[b] - badWordCounts[a]).map(word => (
                                                        <div style={{ marginRight: 5 }}>{`${word}(${badWordCounts[word]})`}</div>
                                                    ))}
                                                    </Typography>
                                                </FlexCol>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <FlexCol>
                                                    <FlexRow><Typography style={{fontWeight: 600, marginRight: 10}}>Resolved Song: </Typography><Typography>{resolvedSong?.full_title}</Typography></FlexRow>
                                                    <FlexRow><Typography style={{fontWeight: 600, marginRight: 10}}>Tempo: </Typography><Typography>{songAnalysis?.track?.tempo} ({songAnalysis?.track?.tempo_confidence})</Typography></FlexRow>
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

function getBadWordsCounts(lyricsEval: any) {
    const badWordCounts: Record<string, number> = {};
    lyricsEval?.bad_words_list?.forEach((badWord: any) => {
        const word = badWord.original.toLowerCase();
        badWordCounts[word] = (badWordCounts[word] ?? 0) + 1;
    });
    return badWordCounts;
}