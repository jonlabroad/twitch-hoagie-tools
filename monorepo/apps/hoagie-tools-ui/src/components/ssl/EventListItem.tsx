import { SongListEventDescription } from '@hoagie/streamersonglist-service';
import { FlexRow } from '../util/FlexBox';
import SouthIcon from '@mui/icons-material/South';
import NorthIcon from '@mui/icons-material/North';
import PlusIcon  from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

import '../../styles/EventList.scss';

const positionPattern = /position (?<fromPos>\d+) to (?<toPos>\d+)/;
const addedPattern = / added /;
const removedPattern = / removed /;
const playedPattern = / has been played/;

export interface EventListItemProps {
  sslEvent: SongListEventDescription;
}

export const EventListItem = (props: EventListItemProps) => {
  const { sslEvent } = props;

  let icon: any = null;

  const positionMatch = sslEvent.text.match(positionPattern);
  const addedMatch = sslEvent.text.match(addedPattern);
  const removedMatch = sslEvent.text.match(removedPattern);
  const playedMatch = sslEvent.text.match(playedPattern);
  if (positionMatch?.groups) {
    const fromPos = positionMatch?.groups?.fromPos;
    const toPos = positionMatch?.groups?.toPos;
    if (fromPos && toPos) {
      if (parseInt(fromPos) < parseInt(toPos)) {
        icon = <SouthIcon style={{ fill: "yellow" }} />;
      } else {
        icon = <NorthIcon style={{ fill: "blue" }} />;
      }
    }
  } else if (addedMatch) {
    icon = <PlusIcon style={{ fill: "green" }} />;
  } else if (removedMatch) {
    icon = <DeleteIcon style={{ fill: "red" }}/>;
  } else if (playedMatch) {
    icon = <MusicNoteIcon />;
  }

  return (
    <FlexRow style={{ marginBottom: 5 }} alignItems="center">
      <div className="event-list-item-timestamp">
        {new Date(sslEvent.timestamp).toLocaleTimeString()}
      </div>
      <div className="event-list-item-icon">{icon}</div>
      <div className="event-list-channel-avatar">
        {sslEvent?.userInfo?.profile_image_url && (
          <img src={sslEvent.userInfo.profile_image_url} />
        )}
      </div>
      <div className="event-list-item-description">{sslEvent.text}</div>
    </FlexRow>
  );
};
