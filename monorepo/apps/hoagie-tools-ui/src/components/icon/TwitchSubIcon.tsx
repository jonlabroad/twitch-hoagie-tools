import { Tooltip } from "@mui/material"
import "./TwitchSubIcon.scss"

const fillColors: Record<string, string> = {
    "1000": "#8f53e9",
    "2000": "#afb1ae",
    "3000": "#ffa500"
}

const tierLabels: Record<string, string> = {
    "1000": "Tier 1",
    "2000": "Tier 2",
    "3000": "Tier 3"
}

export const TwitchSubIcon = (props: { tier: string }) => {
    const tierLabel = tierLabels[props.tier?.toLowerCase()];
    if (!tierLabel) {
        return null;
    }

    const fillColor = fillColors[props.tier?.toLowerCase()] ?? "#8f53e9";

    return (
        <Tooltip title={`${tierLabel} Subscription`}>
            <div className="subicon-container">
                <svg style={{ fill: fillColor }} className="subicon" width="2rem" height="2rem" viewBox="0 0 20 20"><path d="M8.944 2.654c.406-.872 1.706-.872 2.112 0l1.754 3.77 4.2.583c.932.13 1.318 1.209.664 1.853l-3.128 3.083.755 4.272c.163.92-.876 1.603-1.722 1.132L10 15.354l-3.579 1.993c-.846.47-1.885-.212-1.722-1.132l.755-4.272L2.326 8.86c-.654-.644-.268-1.723.664-1.853l4.2-.583 1.754-3.77z"></path></svg>
            </div>
        </ Tooltip>
    );
}

