import { TokenType } from "@hoagie/stream-rewards";
import { Accordion, AccordionDetails, AccordionSummary, Card, CardContent, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import { useMemo } from "react";
import { UserTokenCardHeader } from "./UserTokenCardHeader";
import { UserData } from "@hoagie/service-clients";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FlexRow } from "../util/FlexBox";
import TimeAgo from "javascript-time-ago";
import en from 'javascript-time-ago/locale/en'

const timeAgo = new TimeAgo('en-US');
TimeAgo.addDefaultLocale(en)

interface Props {
  streamerId: string;
  userId: string;
  allStreamerTokens: TokenType[];
  twitchUserData: UserData | undefined | null;
}

export const UserRewardTokens = (props: Props) => {
  const userTokens = useMemo(() => {
    return props.allStreamerTokens.filter((token) => token.ownerId === props.userId);
  }, [props.allStreamerTokens, props.userId]);

  return (
    <Grid container>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
              >
                <UserTokenCardHeader
                  userId={props.userId}
                  numTokens={userTokens.length}
                  twitchUserData={props.twitchUserData}
                />
              </AccordionSummary>
              <AccordionDetails>
              <TableContainer >
                <Table sx={{ maxWidth: 600 }} size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Granted</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>SubType</TableCell>
                      <TableCell>Expires</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userTokens.map((token) => (
                      <TableRow key={token.type + " " + token.subType}>
                        <TableCell>
                          <Tooltip
                            title={new Date(token.grantTimestamp).toLocaleString()}
                          >
                            <p>{timeAgo.format(token.grantTimestamp)}</p>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{token.type}</TableCell>
                        <TableCell>{token.subType}</TableCell>
                        <TableCell>
                          <Tooltip
                            title={new Date(token.expiryTimestamp).toLocaleString()}
                          >
                            <p>{timeAgo.format(token.expiryTimestamp)}</p>
                          </Tooltip>
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
