import { useEffect } from "react";
import LocalStorage from "../util/LocalStorage";

export const useSaveLastPath = () => {
    useEffect(() => {
        const path = window.location.pathname;
        LocalStorage.set("lastPath", { path });
    }, []);
}