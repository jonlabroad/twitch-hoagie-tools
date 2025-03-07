import { Button, Chip, Drawer, Typography } from '@mui/material';
import { useState } from 'react';
import { FlexRow } from '../util/FlexBox';
import "./LyricsDrawer.scss";

interface LyricsDrawerProps {
  badWordsCounts: Record<
    string,
    { count: number; isWhitelisted: boolean }
  > | null;
  lyrics?: string;
}

export const LyricsDrawer = (props: LyricsDrawerProps) => {
  const [open, setOpen] = useState(false);

  if (!props.badWordsCounts || !props.lyrics) {
    return null;
  }

  const splitLyrics = props.lyrics?.split(/\r?\n/) ?? [];

  const badWords = Object.keys(props.badWordsCounts ?? {}).filter(
    (word) => !props.badWordsCounts![word].isWhitelisted
  );

  const renderLine = (line: string, index: number) => {
    const regex = new RegExp(`(\\b${badWords.join('\\b|\\b')}\\b)`, 'gi');
    const lineParts = line.split(regex);
    const renderedLine = (
      <p key={index}>
        {lineParts.map((part, index) => {
          if (badWords.includes(part.toLowerCase())) {
            return (
              <span className="bad-word-highlight" key={index} >
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>
        })}
      </p>
    );
    return renderedLine;
  };

  return (
    <>
      <div style={{ marginRight: 8 }}>
        <Button
          variant="text"
          onClick={(ev) => {
            ev.stopPropagation();
            setOpen(true);
          }}
        >
          Lyrics
        </Button>
      </div>
      <Drawer
        anchor="right"
        open={open}
        onClick={(ev) => ev.stopPropagation()}
        onClose={() => setOpen(false)}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: 500,
            maxWidth: 800,
            padding: 16,
          }}
        >
          <FlexRow>
            <Typography marginRight={2} marginBottom={2} variant="h6">
              Lyrics
            </Typography>
            <Chip label={"BETA"} />
          </FlexRow>
          {splitLyrics.map((line, index) => renderLine(line, index))}
        </div>
      </Drawer>
    </>
  );
};
