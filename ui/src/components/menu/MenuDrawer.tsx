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
import { useNavigate } from "react-router";
import { DarkModeSwitch } from "../DarkModeSwitch";

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

  const navigate = useNavigate();

  useChannelInfo(state.streamer, stateContext);

  const currentPath = window.location.pathname;

  return (
    <>
      <Drawer open={isOpen} onClose={props.onClose}>
        <FlexCol alignItems="center" mt={2} minWidth={250}>
          <StreamerInfo />
          <List>
            <ListItemButton selected={currentPath === `/s/${state.streamer}/dono`} onClick={() => {
              navigate(`/s/${state.streamer}/dono`); onClose()
            }}>
              <ListItemText>Song and Dono List</ListItemText>
            </ListItemButton>
            <ListItemButton selected={currentPath === `/s/${state.streamer}/raid`} onClick={() => {
              navigate(`/s/${state.streamer}/raid`);
              onClose()
            }}>
              <ListItemText>Raid Candidates</ListItemText>
            </ListItemButton>
            <ListItem>
              <DarkModeSwitch />
            </ListItem>
          </List>
        </FlexCol>
      </Drawer>
    </>
  );
};
