import { Collapse, Grid, Typography } from "@mui/material"
import { SpotifyEmbed } from "../spotify/SpotifyEmbed"
import { FlexCol, FlexRow } from "../util/FlexBox"
import { BadWordInfos, BadWordsDetails } from "./BadWordsDetails"

export interface EvaluatedSongDetailsProps {
    expanded: boolean
    badWordCounts: BadWordInfos
    badWordStatus?: {
        statusCode: number,
        statusMessage: string
    }
    spotifyInfo: any
    resolvedSong: any
    songAnalysis: any

    onWordWhitelistChange: (word: string, type: "add" | "remove") => void
}

export const EvaluatedSongDetails = (props: EvaluatedSongDetailsProps) => {
    const { expanded, badWordCounts, spotifyInfo, resolvedSong, songAnalysis, badWordStatus } = props;

    return <>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Grid container style={{ marginTop: 10, marginBottom: 10 }}>
                <Grid item xs={3}>
                    <BadWordsDetails
                        badWordCounts={badWordCounts}
                        onWordWhitelistChange={props.onWordWhitelistChange}
                    />
                </Grid>
                <Grid item xs={4}>
                    <FlexCol>
                        <FlexRow>
                            <Typography style={{ fontWeight: 600, marginRight: 10 }}>Resolved Song: </Typography>
                            <Typography>{resolvedSong?.full_title}</Typography>
                        </FlexRow>
                        <FlexRow>
                            <Typography style={{ fontWeight: 600, marginRight: 10 }}>Tempo: </Typography>
                            <Typography>{songAnalysis?.track?.tempo} ({songAnalysis?.track?.tempo_confidence})</Typography>
                        </FlexRow>
                    </FlexCol>
                </Grid>
                <Grid item xs={4}>
                    <SpotifyEmbed
                        songId={spotifyInfo?.track?.id}
                    />
                </Grid>
            </Grid>
        </Collapse>
    </>
}
