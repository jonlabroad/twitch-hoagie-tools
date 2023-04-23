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
import { useContext, useState } from "react";
import { GeniusLink } from "../links/GeniusLink";
import { SpotifyLink } from "../links/SpotifyLink";
import { FlexCol, FlexRow } from "../util/FlexBox";
import { SongEvalConfig } from "./SongEvalConfig";
import { EvaluatedSongDetails } from "./EvaluatedSongDetails";
import { Evaluations, EvaluationsStatus } from "../../hooks/songQueueEval";
import { DonoData } from "../../service/HoagieClient";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { SslIcon } from "../icon/SslIcon";
import { StateContext } from "../context/StateContextProvider";

const format = require("format-duration");

export interface EvaluatedSongQueueProps {
  config?: SongEvalConfig;
  isLoading: boolean;
  evaluations: Evaluations;
  evaluationsStatus: EvaluationsStatus;
  donoData?: DonoData[];

  onWordWhitelistChange: (word: string, type: "add" | "remove") => void;
}

const headerStyle = {
  fontWeight: 600,
};

const LoadingPlaceholder = (props: { width: number }) => {
  return <Skeleton variant="rectangular" width={props.width} />;
};

const DonoIcon = (props: { donoData: DonoData }) => {
  return (
    <Tooltip title={`\$${props.donoData?.value}`}>
      <div style={{ marginLeft: 8, height: 30, width: 30, color: "gold" }}>
        <MonetizationOnIcon />
      </div>
    </Tooltip>
  );
};

export const EvaluatedSongQueue = (props: EvaluatedSongQueueProps) => {
  const { evaluations, config, donoData } = props;

  const stateContext = useContext(StateContext);
  const { state } = stateContext;

  const [expandedIndex, setExpandedIndex] = useState<number | undefined>(
    undefined
  );

  const songQueue = state.songQueue?.list ?? [];

  return (
    <Grid item xs={12}>
      <TableContainer component={Paper} className="dono-table-container">
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
              const sslListSong = queueSong?.song;
              const nonListSong = queueSong?.nonlistSong;
              const isSslListSong = !!sslListSong;
              const songKey =
                nonListSong ??
                `${sslListSong?.artist?.trim()} - ${sslListSong?.title?.trim()}`;
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
              const userDonoData = evaluation?.user
                ? donoData?.find(
                    (d) =>
                      d.SubKey.toLowerCase().trim() ===
                      evaluation?.user?.toLowerCase().trim()
                  )
                : undefined;
              const userName =
                evaluation?.user ?? queueSong.requests[0].name ?? "";
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
                          {userDonoData ? (
                            <DonoIcon donoData={userDonoData} />
                          ) : (
                            ""
                          )}
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
