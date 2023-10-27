import { useContext, useEffect, useState } from 'react';
import { SongEvalConfig } from '../components/ssl/SongEvalConfig';
import HoagieClient from '../service/HoagieClient';
import { AppState } from '../state/AppState';
import { LoginContext } from '../components/context/LoginContextProvider';
import { LoginState } from '../state/LoginState';
import { SongEvalClient } from '@hoagie/song-eval-service';

export type Evaluations = Record<string, any>;
export type EvaluationsStatus = Record<string, EvaluationStatus>;
export interface EvaluationStatus {
  isLoading: boolean;
  isError: boolean;
}

async function readConfig(state: AppState, loginState: LoginState) {
  if (loginState.username && loginState.accessToken && state.streamer) {
    const client = new HoagieClient();
    const config = await client.readSongEvalConfig(
      loginState.username,
      loginState.accessToken,
      state.streamer
    );
    return config as SongEvalConfig | undefined;
  }
}

export const useSongQueueEval = (
  state: AppState
): [
  Record<string, any>,
  boolean,
  SongEvalConfig | undefined,
  (word: string, type: 'add' | 'remove') => Promise<void>,
  EvaluationsStatus
] => {
  const songQueue = state.songQueue;
  const streamer = state.streamer;

  const [evaluations, setEvaluations] = useState<Evaluations | undefined>({});
  const [evaluationsStatus, setEvaluationsStatus] = useState<EvaluationsStatus>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<SongEvalConfig | undefined>(undefined);
  const { state: loginState } = useContext(LoginContext);

  useEffect(() => {
    updateConfig();
  }, [loginState.username, loginState.accessToken]);

  const updateConfig = async () => {
    const config = await readConfig(state, loginState);
    if (config) {
      setConfig(config);
    }
  };

  const onWhitelistWordChange = async (
    word: string,
    type: 'add' | 'remove'
  ) => {
    if (loginState.username && loginState.accessToken && state.streamer) {
      const client = new HoagieClient();
      if (type === 'add') {
        await client.addWhitelistWord(
          word,
          loginState.username,
          loginState.accessToken,
          state.streamer
        );
      } else if (type === 'remove') {
        await client.removeWhitelistWord(
          word,
          loginState.username,
          loginState.accessToken,
          state.streamer
        );
      }
      await updateConfig();
    }
  };

  const setEvalLoading = (
    songKey: string,
    isLoading: boolean,
    isError: boolean = false
  ) => {
    const status = {
      isLoading,
      isError,
    };
    setEvaluationsStatus((prev) => ({
      ...prev,
      [songKey]: status,
    }));
  };

  useEffect(() => {
    async function evalSongs() {
      if (
        loginState.username &&
        loginState.accessToken &&
        songQueue &&
        (streamer?.toLowerCase() === 'andrewcore' ||
          streamer?.toLowerCase() === 'hoagieman5000' ||
          streamer?.toLowerCase() === 'thesongery' ||
          streamer?.toLowerCase() === 'joplaysviolin')
      ) {
        setIsLoading(true);
        const client = new SongEvalClient();
        const hoagieClient = new HoagieClient();
        await Promise.all(
          songQueue.list.map(async (el) => {
            const songName =
              el.nonlistSong ??
              `${el.song?.artist?.trim()} - ${el.song?.title?.trim()}`;
            if (songName) {
              const doEval = !(evaluations ?? {})[songName];
              if (doEval) {
                let e: any | undefined = undefined;
                try {
                  setEvalLoading(songName, true, false);
                  e = await client.songEval(
                    songName,
                    loginState.username ?? '',
                    loginState.accessToken ?? '',
                    streamer.toLowerCase()
                  );
                } catch (err) {
                  console.error(err);
                  setEvalLoading(songName, false, true);
                  setEvaluations((prev) => ({
                    ...(prev ?? {}),
                    [songName]: {
                      songKey: songName,
                      eval: undefined,
                    },
                  }));
                }

                if (e) {
                  const artist = e?.song?.artist_names;
                  const title = e?.song?.title;
                  const doLookup = !e?.songInfo;
                  let spotifySong: any | undefined = undefined;
                  if (doLookup && artist && title) {
                    spotifySong = await hoagieClient.getSpotifySong(
                      loginState.username ?? '',
                      artist,
                      title,
                      loginState.accessToken ?? '',
                      streamer.toLowerCase()
                    );
                  }

                  setEvalLoading(songName, false, false);
                  setEvaluations((prev) => ({
                    ...(prev ?? {}),
                    [songName]: {
                      songKey: songName,
                      user: el.requests?.map((r) => r.name)?.join(' '),
                      eval: e,
                      songInfo: spotifySong,
                    },
                  }));
                }
              }
            }
          })
        );
        setIsLoading(false);
      }
    }
    evalSongs();
  }, [loginState.username, loginState.accessToken, songQueue?.list]);

  return [
    evaluations ?? {},
    isLoading,
    config,
    onWhitelistWordChange,
    evaluationsStatus,
  ];
};
