import { Grid } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import Config from "../../Config";
import { useSaveLastPath } from "../../hooks/LastPathHooks";
import HoagieClient, { AdminData } from "../../service/HoagieClient";
import { PageHeader } from "../PageHeader";
import { ChatTokenContainer } from "./ChatTokenContainer";
import { StreamerListContainer } from "./StreamerListContainer";
import { LoginContext } from "../context/LoginContextProvider";
import { Admin } from "../../admin/Admin";
import { HoagieSocketAdminContainer } from "./HoagieSocketAdminContainer";
import { ManageEventSub } from "./ManageEventSub";

interface AdminPageProps {}

export const AdminPage = (props: AdminPageProps) => {
  const loginContext = useContext(LoginContext);
  const { state: loginState } = loginContext;

  useSaveLastPath();

  const [adminData, setAdminData] = useState<AdminData | undefined>(undefined);

  async function getAdminConfig() {
    if (loginState.username && loginState.accessToken) {
      const client = new HoagieClient();
      const data = await client.getAdminConfig(
        loginState.username,
        loginState.accessToken
      );
      setAdminData(data);
    }
  }

  useEffect(() => {
    getAdminConfig();
  }, [loginState.username, loginState.accessToken]);

  const isAdmin = Admin.isAdmin(loginState);

  if (!isAdmin) {
    return <div>Admins Only💦💦</div>
  }

  return (
    <>
      <Grid container spacing={3}>
        <Grid item style={{ margin: 10 }} xs={12}>
          <StreamerListContainer
            streamers={adminData?.streamers ?? []}
            onChange={() => getAdminConfig()}
          />
        </Grid>
        <Grid item style={{ margin: 10 }} xs={12}>
          <ChatTokenContainer
            config={adminData}
            onChange={() => getAdminConfig()}
          />
        </Grid>
        <Grid item style={{ margin: 10 }} xs={12}>
          <HoagieSocketAdminContainer />
        </Grid>
        <Grid item style={{ margin: 10 }} xs={12}>
          <ManageEventSub />
        </Grid>
      </Grid>
    </>
  );
};
