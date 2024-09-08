import ProgressBar from "@ramonak/react-progress-bar";
import { CommunitySubathonTipGoals } from "./SubathonGoals";
import { DonoUtil } from "../../util/DonoUtil";

interface Props {
  totalDonos: number;
}

export const SubathonCommunityDonoProgress = (props: Props) => {
  const { totalDonos } = props;

  const goals = CommunitySubathonTipGoals;
  let goalToShowIndex = goals.findIndex((goal) => goal.threshold > totalDonos);
  if (goalToShowIndex === -1) {
    goalToShowIndex = goals.length - 1;
  }

  const previousGoalIndex = goalToShowIndex - 1;
  const previousGoal = goals[previousGoalIndex];
  const previousGoalThreshold = goalToShowIndex > 0 ? previousGoal?.threshold : 0;

  const currentGoalThreshold = goals[goalToShowIndex].threshold;
  const percentageToGoal = ((totalDonos - previousGoalThreshold) / (currentGoalThreshold - previousGoalThreshold)) * 100;

  const label = `${goals[goalToShowIndex].label} (${DonoUtil.formatMoney(totalDonos)} / ${DonoUtil.formatMoney(currentGoalThreshold)})`;

  return (
    <div style={{ marginBottom: 18 }}>
      <ProgressBar
        bgColor="#6498b0"
        labelSize={"18px"}
        width={"400px"}
        height={"32px"}
        labelAlignment="outside"
        customLabel={label}
        completed={percentageToGoal} />
    </div>
  );
}
