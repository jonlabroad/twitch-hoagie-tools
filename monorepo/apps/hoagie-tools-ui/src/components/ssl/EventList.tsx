import { SongListEventDescription } from '@hoagie/streamersonglist-service';
import { EventListItem } from './EventListItem';
import { FlexCol, FlexRow } from '../util/FlexBox';
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
} from '@mui/material';

const tableHeaderStyle = {
  fontWeight: 600,
};

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export interface EventListProps {
  events: SongListEventDescription[];
}

export const EventList = (props: EventListProps) => {
  const { events } = props;
  const sortedEvents = events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return (
      <TableContainer component={Paper} className="dono-table-container" sx={{ maxHeight: 350 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <FlexRow justifyContent="flex-start" alignItems="center">
                  <Typography style={{ ...tableHeaderStyle, width: '100%' }}>
                    Streamer Song List Events
                  </Typography>
                  <Chip label="Beta" color="secondary" />
                </FlexRow>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedEvents.map((sslEvent, index) => (
              <TableRow>
                <TableCell>
                  <EventListItem key={index} sslEvent={sslEvent} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
  );
};
