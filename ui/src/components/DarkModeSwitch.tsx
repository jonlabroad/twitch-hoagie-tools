import React, { createContext, useContext } from "react"
import { FormControlLabel, Switch } from "@material-ui/core"

export interface DarkModeContext {
    darkMode: boolean,
    setDarkMode: (v: boolean) => void
}

export const DarkModeContext = createContext<DarkModeContext>({
    darkMode: false,
    setDarkMode: () => {}
})

export const DarkModeSwitch = () => {
    const darkModeContext = useContext(DarkModeContext)

    return (
        <FormControlLabel
            label="Dark Mode"
            control={
                <Switch
                    value={darkModeContext.darkMode}
                    onChange={() => darkModeContext.setDarkMode(!darkModeContext.darkMode)}
                />
            }
        />
    )
}