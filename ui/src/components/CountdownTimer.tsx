import { useEffect, useRef, useState } from "react"

export interface CountdownTimerProps {
    expiryDate: Date
}

function getDurationMs(expiryDate: Date) {
    const now = new Date();
    return expiryDate.getTime() - now.getTime();
}

export const CountdownTimer = (props: CountdownTimerProps) => {
    const [durationMs, setDurationMs] = useState(0);
    const intervalHandle = useRef<any>(getDurationMs(props.expiryDate));
    const expiryDateRef = useRef<Date>(props.expiryDate);
    
    useEffect(() => {
        intervalHandle.current = setInterval(() => setDurationMs(getDurationMs(expiryDateRef.current)), 500);
        return function cleanup() {
            clearInterval(intervalHandle.current);
        }
    }, []);

    useEffect(() => {
        expiryDateRef.current = props.expiryDate;
        setDurationMs(getDurationMs(props.expiryDate));
    }, [props.expiryDate])

    const durationSec = Math.max(0, durationMs) / 1e3;
    const min = Math.floor(durationSec / 60);
    const sec = Math.round(durationSec - min * 60);
    const secString = sec < 10 ? `0${sec}` : sec.toString();

    return <div className="countdown-timer">
        {min}:{secString}
    </div>
}