import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, Typography, Grid } from "@material-ui/core";
import { useContext } from "react";
import { StateContext } from "../MainPage";
import { FlexCol, FlexRow } from "../util/FlexBox";

export interface EvaluatedSongQueueProps {
    evaluations: Record<string, any>;
}

export const EvaluatedSongQueue = (props: EvaluatedSongQueueProps) => {
    const { evaluations } = props;

    const stateContext = useContext(StateContext);
    const { state } = stateContext;

    console.log({ e: evaluations });

    return <Grid item xs={12}><TableContainer component={Paper} className="dono-table-container">
        <Table size="small">
            <TableHead>
                {Object.keys(evaluations ?? {}).map(songName => {
                    const badWordCounts = getBadWordsCounts(evaluations[songName].lyricsEval);
                    return (
                        <TableRow>
                            <TableCell>
                                <FlexRow>
                                    <Typography style={{marginRight: 18}}>{songName}</Typography>
                                    {Object.keys(badWordCounts).map(word => (
                                        <div style={{marginRight: 5}}>{`${word}(${badWordCounts[word]})`}</div>
                                    ))}
                                </FlexRow>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableHead>
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