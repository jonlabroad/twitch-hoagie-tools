import { Tooltip } from "@mui/material";
import "./MoneyIcon.scss"

export const MoneyIcon = () => {
    return (
        <div className="moneyicon-container">
            <Tooltip title="Dono">
                <img className="moneyicon" src="/MoneyIcon.svg" />
            </Tooltip>
        </div>
    );
}