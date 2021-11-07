import { useEffect, useRef, useState } from "react"

export interface CountdownTimerProps {
    expiryDate: Date
}

function getDurationMs(expiryDate: Date) {
    const now = new Date();
    return expiryDate.getTime() - now.getTime();
}

function getElapsedMs(startDate: Date) {
    const now = new Date();
    return now.getTime() - startDate.getTime();
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

export interface CountupTimerProps {
    startDate: Date
}

export const CountupTimer = (props: CountupTimerProps) => {
    const [elapsedMs, setElapsedMs] = useState(0);
    const intervalHandle = useRef<any>(getElapsedMs(props.startDate));
    const startDateRef = useRef<Date>(props.startDate);
    
    useEffect(() => {
        intervalHandle.current = setInterval(() => setElapsedMs(getElapsedMs(startDateRef.current)), 500);
        return function cleanup() {
            clearInterval(intervalHandle.current);
        }
    }, []);

    useEffect(() => {
        startDateRef.current = props.startDate;
        setElapsedMs(getElapsedMs(props.startDate));
    }, [props.startDate])

    const durationSec = Math.max(0, elapsedMs) / 1e3;
    const hour = Math.floor(durationSec / (60 * 60));
    const min = Math.floor((durationSec - hour * 60 * 60) / 60);
    const sec = Math.round(durationSec - hour * 60 * 60 - min * 60);
    const minString = min < 10 ? `0${min}` : min.toString();
    const secString = sec < 10 ? `0${sec}` : sec.toString();

    return <div className="countup-timer">
        {hour !== 0 ? `${hour}:` : ''}{minString}:{secString}
    </div>
}