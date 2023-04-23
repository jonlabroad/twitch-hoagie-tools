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

export interface MenuDrawerProps {
  isOpen: boolean;

  onClose: () => void;
}

export const MenuDrawer = (props: MenuDrawerProps) => {
  const { isOpen } = props;

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
        <FlexCol alignItems="center" p={3} minWidth={200}>
          <StreamerInfo />
          <List dense>
            <ListItemButton selected={currentPath === `/s/${state.streamer}/dono`} onClick={() => navigate(`/s/${state.streamer}/dono`)}>
              <ListItemText>Song and Dono List</ListItemText>
            </ListItemButton>
            <ListItemButton selected={currentPath === `/s/${state.streamer}/raid`} onClick={() => navigate(`/s/${state.streamer}/raid`)}>
              <ListItemText>Raid Targets</ListItemText>
            </ListItemButton>
          </List>
        </FlexCol>
      </Drawer>
    </>
  );
};
