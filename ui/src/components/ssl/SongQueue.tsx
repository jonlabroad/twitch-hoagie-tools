import React, { useContext } from "react";
import { SongListSong } from "../../service/StreamerSongListClient";
import { StateContext } from "../MainPage";
import { FlexCol, FlexRow } from "../util/FlexBox";

import "../../styles/SongQueue.scss";
import { Card } from "@material-ui/core";

export interface SongQueueProps {
}

export const SongQueue = (props: SongQueueProps) => {
    const { state } = useContext(StateContext);

    let currentSong: SongListSong | undefined;
    if (state.songQueue?.list && state.songQueue.list.length > 0) {
        currentSong = state.songQueue.list[0];
    }

    return (
        <Card className="songqueue-card">
            <FlexCol className="songqueue-container">
                {state.songQueue?.list?.slice(0, 5).map((song, i) => <React.Fragment>
                    <FlexRow className={`${i === 0 ? "songqueue-currentsong" : ""} songqueue-song`}>
                        <div className="songqueue-artist">{song.song?.artist}</div>
                        <div className="songqueue-title">{song.song?.title}</div>
                    </FlexRow>
                </React.Fragment>
                )}
            </FlexCol>
        </Card>
    );

}