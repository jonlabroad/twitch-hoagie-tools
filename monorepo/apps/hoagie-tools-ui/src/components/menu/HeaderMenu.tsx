import { IconButton } from "@mui/material"
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from "react";
import { MenuDrawer } from "./MenuDrawer";

export interface HeaderMenuProps {

}

export const HeaderMenu = (props: HeaderMenuProps) => {
    const [isOpen, setIsOpen] = useState(false)

    return <>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={() => setIsOpen(true)}
        >
          <MenuIcon />
        </IconButton>
        <MenuDrawer isOpen={isOpen} onClose={() => setIsOpen(false)}/>
    </>
}
