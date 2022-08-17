import { useState } from "react";
import { FlexRow } from "./FlexBox";
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

export const Expandable = (props: {
    summary: React.ReactChild | React.ReactChildren
    children: React.ReactChild | React.ReactChildren
    showExpand: boolean
    style?: Record<string, any>
}) => {
    const [open, setOpen] = useState(false);

    return <div onClick={() => setOpen(!open)} style={{ cursor: "pointer", ...(props.style ?? {}) }}>
        <FlexRow alignItems="center" justifyContent="space-between">
            {props.summary}
            {props.showExpand && open && <ExpandLess />}
            {props.showExpand && !open && <ExpandMore />}
        </FlexRow>
        {open && <>{props.children}</>}
    </div>
}