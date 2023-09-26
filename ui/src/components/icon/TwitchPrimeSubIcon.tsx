import { Tooltip } from "@mui/material"
import "./TwitchPrimeSubIcon.scss"

export const TwitchPrimeSubIcon = (props: { tier: string }) => {
    if (props.tier?.toLowerCase() !== "prime") {
        return null;
    }

    return (
        <Tooltip title="Prime Subscription">
            <div className="primesubicon-container">
            <svg className="primesubicon" type="color-fill-brand" width="20px" height="20px" version="1.1" viewBox="0 0 20 20" x="0px" y="0px"><g><path fillRule="evenodd" clipRule="evenodd" d="M18 5v8a2 2 0 0 1-2 2H4a2.002 2.002 0 0 1-2-2V5l4 3 4-4 4 4 4-3z"></path></g></svg>
            </div>
        </ Tooltip>
    );
}
