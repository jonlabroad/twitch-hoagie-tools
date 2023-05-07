import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { FlexCol, FlexRow } from "../util/FlexBox";
import { useContext } from "react";
import { StreamerInfo } from "./StreamerInfo";
import { useChannelInfo } from "../../hooks/channelInfoHooks";
import { StateContext } from "../context/StateContextProvider";
import { generatePath, useNavigate } from "react-router";
import { DarkModeSwitch } from "../DarkModeSwitch";
import Config from "../../Config";
import { ModListContext } from "../context/ModListContextProvider";
import { LoginContext } from "../context/LoginContextProvider";

export interface MenuDrawerProps {
  isOpen: boolean;

  onClose: () => void;
}

export const MenuDrawer = (props: MenuDrawerProps) => {
  const { isOpen, onClose } = props;

  const stateContext = useContext(StateContext);
  const {
    state,
    state: { streamerData },
  } = stateContext;

  const { state: loginState } = useContext(LoginContext);

  const { mods } = useContext(ModListContext);
  const isMod =
    loginState.username &&
    loginState.isLoggedIn &&
    mods
      .map((m) => m.toLowerCase())
      .includes(loginState.username.toLowerCase());

  const isAdmin =
    loginState.username &&
    loginState.isLoggedIn &&
    Config.admins
      .map((m) => m.toLowerCase())
      .includes(loginState.username.toLowerCase());

  const navigate = useNavigate();

  useChannelInfo(state.streamer, stateContext);

  const currentPath = window.location.pathname;

  if (!state.streamer) {
    return <></>;
  }

  function hasAccess(accessLevel: string) {
    return (accessLevel === "mod" && isMod) || isAdmin;
  }

  return (
    <>
      <Drawer open={isOpen} onClose={props.onClose}>
        <FlexCol alignItems="center" mt={2} minWidth={250}>
          <StreamerInfo />
          <List>
            {Object.entries(Config.pages)
              .filter(([key, page]) => hasAccess(page.access))
              .map(([key, page]) => {
                const resolvedPath = generatePath(page.path, {
                  streamer: state.streamer,
                });
                return (
                  <ListItemButton
                    selected={currentPath === resolvedPath}
                    onClick={() => {
                      navigate(resolvedPath);
                      onClose();
                    }}
                  >
                    <ListItemText>{page.title}</ListItemText>
                  </ListItemButton>
                );
              })}
            <ListItem>
              <DarkModeSwitch />
            </ListItem>
          </List>
        </FlexCol>
      </Drawer>
    </>
  );
};
