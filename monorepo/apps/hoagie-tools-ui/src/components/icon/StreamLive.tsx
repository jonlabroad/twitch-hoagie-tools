import { FlexRow } from '../util/FlexBox';
import './StreamLiveIcon.scss';

interface StreamLiveIconProps {
  style?: React.CSSProperties;
  isLive: boolean;
}

export const StreamLiveIcon = (props: StreamLiveIconProps) => {
  if (!props.isLive) {
    return <></>;
  }

  return (
    <FlexRow
      style={props.style}
      alignItems="center"
      justifyContent="center"
      className="stream-live-icon"
    >
      LIVE
    </FlexRow>
  );
};
