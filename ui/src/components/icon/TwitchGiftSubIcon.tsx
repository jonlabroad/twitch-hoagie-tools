import { Tooltip } from "@mui/material"
import "./TwitchGiftSubIcon.scss"

export const TwitchGiftSubIcon = () => {
    return (
        <Tooltip title="Gift Subs">
            <div className="giftsubicon-container">
            <svg className="giftsubicon" width="100%" height="100%" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16 6h2v6h-1v6H3v-6H2V6h2V4.793c0-2.507 3.03-3.762 4.803-1.99.131.131.249.275.352.429L10 4.5l.845-1.268a2.81 2.81 0 0 1 .352-.429C12.969 1.031 16 2.286 16 4.793V6zM6 4.793V6h2.596L7.49 4.341A.814.814 0 0 0 6 4.793zm8 0V6h-2.596l1.106-1.659a.814.814 0 0 1 1.49.451zM16 8v2h-5V8h5zm-1 8v-4h-4v4h4zM9 8v2H4V8h5zm0 4H5v4h4v-4z" clipRule="evenodd"></path></svg>
            </div>
        </ Tooltip>
    );
}


