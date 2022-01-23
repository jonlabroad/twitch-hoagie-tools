import { Table, TableHead, TableRow, TableCell, TableBody, Card, TableContainer, Paper, Typography, styled } from "@material-ui/core"
import { DonoData } from "../../service/HoagieClient";

import "../../styles/Dono.scss";

const tableHeaderStyle = {
    fontWeight: 600
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: "#F9F9F9"
    },
  }));

interface DonoTableProps {
    donoData: DonoData[];
}

export const DonoTable = (props: DonoTableProps) => {
    const { donoData } = props;

    return (
        <TableContainer component={Paper} className="dono-table-container">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell><Typography style={tableHeaderStyle}>Username</Typography></TableCell>
                        <TableCell align="right"><Typography style={tableHeaderStyle}>Dono</Typography></TableCell>
                        <TableCell align="right"><Typography style={tableHeaderStyle}>Cheer</Typography></TableCell>
                        <TableCell align="right"><Typography style={tableHeaderStyle}>Sub</Typography></TableCell>
                        <TableCell align="right"><Typography style={tableHeaderStyle}>Gifted Subs</Typography></TableCell>
                        <TableCell align="right"><Typography style={tableHeaderStyle}>Value</Typography></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {donoData && donoData?.map(userdata => (
                        <StyledTableRow>
                            <TableCell>{userdata.SubKey}</TableCell>
                            <TableCell align="right">{userdata.dono}</TableCell>
                            <TableCell align="right">{userdata.cheer}</TableCell>
                            <TableCell align="right">{userdata.sub}</TableCell>
                            <TableCell align="right">{userdata.subgift}</TableCell>
                            <TableCell align="right">${userdata.value.toString()}</TableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
