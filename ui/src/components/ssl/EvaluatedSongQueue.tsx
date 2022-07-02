import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, Typography, Grid, TableBody, Accordion, AccordionSummary, Collapse } from "@material-ui/core";
import { useContext, useState } from "react";
import { StateContext } from "../MainPage";
import { FlexCol, FlexRow } from "../util/FlexBox";

export interface EvaluatedSongQueueProps {
    evaluations: Record<string, any>;
}

export const EvaluatedSongQueue = (props: EvaluatedSongQueueProps) => {
    const { evaluations } = props;

    const stateContext = useContext(StateContext);
    const { state } = stateContext;

    const [expandedIndex, setExpandedIndex] = useState<number | undefined>(undefined);

    console.log({ e: evaluations });

    console.log({ expandedIndex });
    return <Grid item xs={12}><TableContainer component={Paper} className="dono-table-container">
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>SSL Song</TableCell>
                    <TableCell>Resolved Song Name</TableCell>
                    <TableCell># Bad Words</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {Object.keys(evaluations ?? {}).map((songName, i) => {
                    const badWordCounts = getBadWordsCounts(evaluations[songName].lyricsEval);
                    const totalBadWords = Object.values(badWordCounts).reduce((prev, curr) => curr + prev, 0);
                    const resolvedSong = evaluations[songName].song;
                    const genres = (evaluations[songName].songInfo?.artist?.genres ?? []) as string[];
                    return (
                        <>
                            <TableRow style={{ cursor: "pointer" }} onClick={() => setExpandedIndex(i !== expandedIndex ? i : undefined)}>
                                <TableCell><Typography>{songName}</Typography></TableCell>
                                <TableCell><Typography>{resolvedSong.full_title}</Typography></TableCell>
                                <TableCell><Typography>{totalBadWords}</Typography></TableCell>
                                <TableCell><Typography>{genres.join(", ")}</Typography></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                    <Collapse in={expandedIndex === i} timeout="auto" unmountOnExit>
                                        <Grid container>
                                            <Grid item xs={3}>
                                                <FlexCol>
                                                    <Typography component="h6">Words</Typography>
                                                    {Object.keys(badWordCounts).sort((a, b) => badWordCounts[b] - badWordCounts[a]).map(word => (
                                                        <div style={{ marginRight: 5 }}>{`${word}(${badWordCounts[word]})`}</div>
                                                    ))}
                                                </FlexCol>
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