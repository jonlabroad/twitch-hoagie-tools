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

  useChannelInfo(state.streamer, stateContext);

  const currentPath = window.location.pathname;

  return (
    <>
      <Drawer open={isOpen} onClose={props.onClose}>
        <FlexCol alignItems="center" p={3} minWidth={200}>
          <StreamerInfo />
          <List dense>
            <ListItemButton selected={currentPath === `/dono/${state.streamer}`} component={"a"} href={`/dono/${state.streamer}`}>
              <ListItemText>Song and Dono List</ListItemText>
            </ListItemButton>
            <ListItemButton selected={currentPath === `/s/${state.streamer}`} component={"a"} href={`/s/${state.streamer}`}>
              <ListItemText>Raid Targets</ListItemText>
            </ListItemButton>
          </List>
        </FlexCol>
      </Drawer>
    </>
  );
};
