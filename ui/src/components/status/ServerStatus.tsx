import { useContext } from "react";
import { SystemStatusContext } from "../context/SystemStatusContextProvider";
import { Tooltip } from "@mui/material";
import CheckCircle from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface ServerStatusProps {}

export const ServerStatus = (props: ServerStatusProps) => {
    const { status } = useContext(SystemStatusContext);

    const isRunning = status?.status?.chatEventSource?.isRunning ?? false;
    const color = isRunning ? "success" : "error";
    const message = status?.status?.chatEventSource?.statusMessage ?? "Unknown status";

    return (
        <Tooltip title={message}>
            {isRunning ? <CheckCircle color={color} /> : <ErrorIcon color={color} />}
        </Tooltip>
    );
};