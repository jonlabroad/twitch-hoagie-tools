import { Tooltip } from "@mui/material";
import "./TwitchBitIcon.scss"

export const TwitchBitIcon = () => {
    return (
        <div className="biticon-container">
            <Tooltip title="Bits">
                <svg width="100%" height="100%" version="1.1" viewBox="0 0 20 20" x="0px" y="0px" aria-hidden="true" focusable="false" className="biticon">
                    <path fillRule="evenodd" clipRule="evenodd" d="M3 12l7-10 7 10-7 6-7-6zm2.678-.338L10 5.487l4.322 6.173-.85.728L10 11l-3.473 1.39-.849-.729z"></path>
                </svg>
            </Tooltip>
        </div>
    );
}