import {
  SSLEventListItem,
  SongListEventDescription,
} from '@hoagie/streamersonglist-service';
import { EventListItem } from './EventListItem';
import { FlexCol, FlexRow } from '../../util/FlexBox';
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Typography,
  Hidden,
  TableBody,
  styled,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { useContext, useEffect, useMemo } from 'react';
import { TwitchUserInfoContext } from '../../context/TwitchUserInfoProvider';

const tableHeaderStyle = {
  fontWeight: 600,
};

export interface EventListProps {
  events: SSLEventListItem[];
  isLoading: boolean;
}

export const EventList = (props: EventListProps) => {
  const { events } = props;

  const { userData: userDataRepo, addUsers } = useContext(TwitchUserInfoContext);

  useEffect(() => {
    const userLogins = getAllUsers(events);
    addUsers?.(userLogins);
  }, [events]);

  const sortedEvents = events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <TableContainer
      component={Paper}
      className="dono-table-container"
      sx={{ maxHeight: 600 }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell colSpan={4}>
              <FlexRow justifyContent="flex-start" alignItems="center">
                <Typography style={{ ...tableHeaderStyle, width: '100%' }}>
                  Streamer Song List Events
                </Typography>
                <Tooltip title="IT SAYS 'BETA'">
                  <Chip label="Beta" color="secondary" />
                </Tooltip>
              </FlexRow>
              <div style={{ marginTop: 8, minHeight: 5 }}>{props.isLoading && <LinearProgress />}</div>
            </TableCell>
          </TableRow>
        </TableHead>
        {useMemo(() => (
          <TableBody>
            {sortedEvents.map((sslEvent, index) => (
                <TableRow>
                <TableCell>
                  <EventListItem isFirst={index === 0} key={`event-${sslEvent.id ?? sslEvent.timestamp}`} sslEvent={sslEvent} userData={userDataRepo}/>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          ), [sortedEvents])}
      </Table>
    </TableContainer>
  );
};

const getAllUsers = (events: SSLEventListItem[]) => {
  const users = new Set<string>();
  events.forEach((event) => {
    if (event.userLogin) {
      users.add(event.userLogin);
    }
  });
  return Array.from(users);
};
