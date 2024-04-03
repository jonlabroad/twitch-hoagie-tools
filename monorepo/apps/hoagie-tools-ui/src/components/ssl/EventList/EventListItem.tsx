import {
  SSLEventListItem,
  SongListEventDescription,
  SongMovedItem,
} from '@hoagie/streamersonglist-service';
import { FlexRow } from '../../util/FlexBox';
import SouthIcon from '@mui/icons-material/South';
import NorthIcon from '@mui/icons-material/North';
import PlusIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import '../../../styles/EventList.scss';
import { UserData } from '@hoagie/service-clients';

import TimeAgo from 'javascript-time-ago';
import ReactTimeAgo from 'react-time-ago';
import en from 'javascript-time-ago/locale/en';
import { TableCell, Tooltip } from '@mui/material';

TimeAgo.addDefaultLocale(en);

export interface EventListItemProps {
  sslEvent: SSLEventListItem;
  userData: Record<string, UserData>;
}

const getIcon = (sslEvent: SSLEventListItem) => {
  switch (sslEvent.eventType) {
    case 'queue-event':
      switch (sslEvent.type) {
        case 'added':
          return <PlusIcon style={{ fill: '#5cffbe' }} />;
        case 'moved':
          const movedData = sslEvent.data as SongMovedItem;
          console.log({ movedData});
          return (movedData.newPosition ?? 0) < (movedData.oldPosition ?? 0) ? (
            <NorthIcon style={{ fill: '#00ad03' }} />
          ) : (
            <SouthIcon style={{ fill: '#d0d003' }} />
          );
        case 'deleted':
          return <DeleteIcon style={{ fill: '#eb0400' }} />;
      }
    case 'new-playhistory':
      return <PlayArrowIcon style={{ fill: "#1f69ff" }}/>;
  }
};

const getTooltip = (sslEvent: SSLEventListItem) => {
  switch (sslEvent.eventType) {
    case 'queue-event':
      switch (sslEvent.type) {
        case 'added':
          return 'Added';
        case 'moved':
          const movedData = sslEvent.data as SongMovedItem;
          return `Moved ${movedData.oldPosition} to ${movedData.newPosition}`;
        case 'deleted':
          return 'Deleted';
      }
    case 'new-playhistory':
      return 'Played';
  }
}

const getText = (sslEvent: SSLEventListItem) => {
  return `${sslEvent.data.song}`;

  switch (sslEvent.eventType) {
    case 'queue-event':
      switch (sslEvent.type) {
        case 'added':
          return `${sslEvent.data.song} added`;
        case 'moved':
          const movedData = sslEvent.data as SongMovedItem;
          return `${sslEvent.data.song} moved from ${movedData.oldPosition} to ${movedData.newPosition}`;
        case 'deleted':
          return `${sslEvent.data.song} deleted`;
      }
    case 'new-playhistory':
      return `${sslEvent.data.song} has been played`;
  }
};

export const EventListItem = (props: EventListItemProps) => {
  const { sslEvent, userData } = props;

  const icon = getIcon(sslEvent);

  const avatarImageUrl =
    sslEvent.userLogin &&
    userData[sslEvent.userLogin.toLowerCase()]?.profile_image_url;

  const timestampDate = new Date(sslEvent.timestamp);

  return (
    <>
      <FlexRow alignItems="center">
        <Tooltip placement="top-end" title={timestampDate.toLocaleString()}>
          <div className="event-list-item-timestamp">
            <ReactTimeAgo date={timestampDate} />
          </div>
        </Tooltip>
        <Tooltip placement="top-end" title={sslEvent.userLogin}>
          <div className="event-list-channel-avatar">
            {avatarImageUrl && <img src={avatarImageUrl} />}
            {!avatarImageUrl && sslEvent.eventType !== "new-playhistory" &&
              <AccountCircleIcon fontSize="large" style={{ fill: "grey" }}/>
            }
          </div>
        </Tooltip>
        <Tooltip placement="top-end" title={getTooltip(sslEvent)}>
          <div className="event-list-item-icon">{icon}</div>
        </Tooltip>
        <div className="event-list-item-description">{getText(sslEvent)}</div>
      </FlexRow>
    </>
  );
};
