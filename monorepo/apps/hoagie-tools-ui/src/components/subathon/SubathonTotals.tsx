import { UserDonoSummaries } from "@hoagie/dono-service"
import { FlexCol } from "../util/FlexBox";
import { Typography } from "@mui/material";
import { SubathonCommunitySubGiftProgress } from "./SubathonCommunitySubGiftProgress";
import { SubathonCommunityDonoProgress } from "./SubathonCommunityDonoProgress";
import { DonoUtil } from "../../util/DonoUtil";

interface Props {
  donoData: UserDonoSummaries;
}

export const SubathonTotals = (props: Props) => {
  const { donoData } = props;

  const totalDonos = Object.values(donoData).reduce((acc, d) => acc + d.dono, 0);
  const totalSubGifts = Object.values(donoData).reduce((acc, d) => acc + d.subgifts, 0);

  return (
    <FlexCol marginTop={4}>
      <Typography marginBottom={1}>Donos: {DonoUtil.formatMoney(totalDonos)}</Typography>
      <SubathonCommunityDonoProgress totalDonos={totalDonos} />
      <Typography marginBottom={1}>Sub Gifts: {totalSubGifts}</Typography>
      <SubathonCommunitySubGiftProgress numSubGifts={totalSubGifts} />
    </FlexCol>
  );
};
