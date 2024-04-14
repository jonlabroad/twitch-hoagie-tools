import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Typography,
  Grid,
  TableBody,
  Hidden,
  Tooltip,
  Skeleton,
} from "@mui/material";
import { useContext, useMemo, useState } from "react";
import { GeniusLink } from "../links/GeniusLink";
import { SpotifyLink } from "../links/SpotifyLink";
import { FlexCol, FlexRow } from "../util/FlexBox";
import { EvaluatedSongDetails } from "./EvaluatedSongDetails";
import { Evaluations, EvaluationsStatus } from "../../hooks/songQueueEval";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { SslIcon } from "../icon/SslIcon";
import { StateContext } from "../context/StateContextProvider";

import format from "format-duration";
import { DonoContext } from "../dono/DonoContextProvider";
import { DonoUtil } from "../../util/DonoUtil";
import { SongEvalConfigData } from "@hoagie/song-eval-service";

const maxSongDurationMillis = 7 * 60 * 1e3;
const defaultSongDurationMillis = 4 * 60 * 1e3;

export interface EvaluatedSongQueueProps {
  config?: SongEvalConfigData;
  isLoading: boolean;
  evaluations: Evaluations;
  evaluationsStatus: EvaluationsStatus;

  onWordWhitelistChange: (word: string, type: "add" | "remove") => void;
}

const headerStyle = {
  fontWeight: 600,
};

const LoadingPlaceholder = (props: { width: number }) => {
  return <Skeleton variant="rectangular" width={props.width} />;
};

const DonoIcon = (props: { username: string }) => {
  const { state: donoData } = useContext(DonoContext);

  const eligibleDonoData = DonoUtil.getEligibleDonos(donoData?.donoData, 5).eligible;
  const userDonoData = eligibleDonoData.find(d => d.username.toLowerCase() === props.username.toLowerCase());

  return (
    useMemo(() => (userDonoData &&
      <Tooltip title={`\$${userDonoData?.value}`}>
        <div style={{ marginLeft: 8, height: 30, width: 30, color: "gold" }}>
          <MonetizationOnIcon />
        </div>
      </Tooltip>
    ), [userDonoData])
  );
};

export const EvaluatedSongQueue = (props: EvaluatedSongQueueProps) => {
  const { evaluations, config } = props;

  const stateContext = useContext(StateContext);
  const { state } = stateContext;

  const [expandedIndex, setExpandedIndex] = useState<number | undefined>(
    undefined
  );

  const songQueue = state.songQueue?.list ?? [];

  const estimatedQueueDurationMillis = songQueue.reduce(
    (prev, curr) => {
      const songKey = getSongKey(curr);
      const evaluation = evaluations[songKey] as any | undefined;
      const spotifyInfo = evaluation?.songInfo;
      let durationMs = spotifyInfo?.track?.duration_ms ?? defaultSongDurationMillis;
      durationMs = Math.min(durationMs, maxSongDurationMillis);
      return prev + durationMs;
    },
    0
  );

  return (<>
    <Grid item xs={12}>
      <TableContainer component={Paper} className="dono-table-container">
        <FlexRow
          alignItems="center"
          style={{
            minHeight: 30,
          }}
        >
          <div style={{
            marginLeft: 10,
            fontSize: 14,
          }}>
            {estimatedQueueDurationMillis > 0 ? `Est. queue duration: ${format(estimatedQueueDurationMillis)}` : ""}
          </div>
        </FlexRow>
        <Table size="small">
          <TableHead>
            <TableRow>
              <Hidden mdDown>
                <TableCell>
                  <Typography style={headerStyle}>Pos</Typography>
                </TableCell>
              </Hidden>
              <TableCell>
                <Typography style={headerStyle}>SSL Song</Typography>
              </TableCell>
              <Hidden mdDown>
                <TableCell>
                  <Typography style={headerStyle}>User</Typography>
                </TableCell>
              </Hidden>
              <TableCell>
                <Typography style={headerStyle}># Bad Words</Typography>
              </TableCell>
              <TableCell>
                <Typography style={headerStyle}>Duration</Typography>
              </TableCell>
              <Hidden mdDown>
                <TableCell>
                  <Typography style={headerStyle}>Time Signature</Typography>
                </TableCell>
              </Hidden>
              <TableCell>
                <Typography style={headerStyle}>Genres</Typography>
              </TableCell>
              <TableCell>
                <Typography style={headerStyle}>Links</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {songQueue?.map((queueSong: any, i: number) => {
              const isSslListSong = !!queueSong?.song;
              const songKey = getSongKey(queueSong);
              const evaluation = evaluations[songKey] as any | undefined;
              const badWordStatus = evaluation?.eval?.lyricsEval?.status;
              const badWordCounts = getBadWordsCounts(
                evaluation?.eval?.lyricsEval,
                config?.whitelist ?? []
              );
              const totalBadWords = !badWordStatus?.isError
                ? Object.values(badWordCounts)
                    .filter((w) => !w.isWhitelisted)
                    .reduce((prev, curr) => curr.count + prev, 0)
                : "X";
              const resolvedSong = evaluation?.eval?.song;
              const lyricsLink = resolvedSong?.url;
              const spotifyInfo = evaluation?.songInfo;
              const songAnalysis = spotifyInfo?.analysis;
              const spotifyLink = spotifyInfo?.track?.external_urls?.spotify;
              const durationMs = spotifyInfo?.track?.duration_ms ?? 0;
              const durationFormatted = format(durationMs);
              const genres = (evaluation?.songInfo?.artist?.genres ??
                []) as string[];
              const timeSignature = songAnalysis?.track?.time_signature;
              const timeSignatureText = timeSignature
                ? `${timeSignature}/4`
                : "";
              const timeSignatureConfidenceText = timeSignature
                ? `(${songAnalysis?.track?.time_signature_confidence})`
                : "";
              const genreText = genres.join(", ");
              const userName =
                evaluation?.user ?? queueSong.requests[0]?.name ?? "";
              const evaluationStatus = props.evaluationsStatus[songKey];
              return (
                <>
                  <TableRow
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setExpandedIndex(i !== expandedIndex ? i : undefined)
                    }
                  >
                    <Hidden mdDown>
                      <TableCell width={1}>{i + 1}</TableCell>
                    </Hidden>
                    <TableCell>
                      <FlexCol style={{ minHeight: 45 }}>
                        <FlexRow alignItems="center">
                          {isSslListSong && <SslIcon />}
                          <Typography ml={0}>{songKey}</Typography>
                        </FlexRow>
                        <Typography style={{ fontSize: 14, color: "grey" }}>
                          {resolvedSong
                            ? `${resolvedSong?.artist_names} - ${resolvedSong?.title}`
                            : ""}
                        </Typography>
                      </FlexCol>
                    </TableCell>
                    <Hidden mdDown>
                      <TableCell>
                        <FlexRow>
                          <Typography>{userName}</Typography>
                            <DonoIcon username={userName as string} />
                        </FlexRow>
                      </TableCell>
                    </Hidden>

                    <>
                      <TableCell>
                        {evaluationStatus?.isLoading ? (
                          <LoadingPlaceholder width={40} />
                        ) : (
                          <Tooltip title={badWordStatus?.statusMessage}>
                            <Typography>
                              {evaluation?.eval ? totalBadWords : ""}
                            </Typography>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        {evaluationStatus?.isLoading ? (
                          <LoadingPlaceholder width={40} />
                        ) : (
                          <Typography>
                            {evaluation?.eval ? durationFormatted : ""}
                          </Typography>
                        )}
                      </TableCell>
                      <Hidden mdDown>
                        <TableCell>
                          {evaluationStatus?.isLoading ? (
                            <LoadingPlaceholder width={40} />
                          ) : (
                            <FlexRow alignItems="center" mr={3}>
                              <Typography>{timeSignatureText}&nbsp;</Typography>
                              <Typography variant="body2" color="textSecondary">
                                {timeSignatureConfidenceText}
                              </Typography>
                            </FlexRow>
                          )}
                        </TableCell>
                      </Hidden>
                      <TableCell>
                        {evaluationStatus?.isLoading ? (
                          <LoadingPlaceholder width={200} />
                        ) : (
                          <Typography>{genreText}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {evaluationStatus?.isLoading ? (
                          <LoadingPlaceholder width={120} />
                        ) : (
                          <FlexRow>
                            {lyricsLink && <GeniusLink href={lyricsLink} />}
                            {spotifyLink && <SpotifyLink href={spotifyLink} />}
                          </FlexRow>
                        )}
                      </TableCell>
                    </>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                      colSpan={8}
                    >
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
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  </>
  );
};

function getBadWordsCounts(
  lyricsEval: any,
  whitelist: string[]
): Record<string, { count: number; isWhitelisted: boolean }> {
  const badWordCounts: Record<
    string,
    { count: number; isWhitelisted: boolean }
  > = {};
  lyricsEval?.bad_words_list?.forEach((badWord: any) => {
    const word = badWord.original.toLowerCase();
    badWordCounts[word] = {
      count: (badWordCounts[word]?.count ?? 0) + 1,
      isWhitelisted: whitelist
        .map((w) => w.toLowerCase())
        .includes(word.toLowerCase()),
    };
  });
  return badWordCounts;
}

function getSongKey(queueSong: any): string {
  const sslListSong = queueSong?.song;
  const nonListSong = queueSong?.nonlistSong;
  const songKey =
    nonListSong ??
    `${sslListSong?.artist?.trim()} - ${sslListSong?.title?.trim()}`;
  return songKey;
}
