import React, { createContext, useContext } from "react"
import { FormControlLabel, Switch } from "@material-ui/core"

export interface DarkModeContext {
    darkMode?: boolean,
    setDarkMode: (v: boolean) => void
}

export const DarkModeContext = createContext<DarkModeContext>({
    darkMode: false,
    setDarkMode: () => { }
})

export const DarkModeSwitch = () => {
    const darkModeContext = useContext(DarkModeContext)

    return <>
        {typeof darkModeContext !== "undefined" && <FormControlLabel
            label="Dark Mode"
            control={
                <Switch
                    checked={darkModeContext.darkMode}
                    onChange={() => darkModeContext.setDarkMode(!darkModeContext.darkMode)}
                />
            }
        />
        }
    </>
}