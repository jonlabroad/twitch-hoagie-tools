import ProgressBar from "@ramonak/react-progress-bar";
import { CommunitySubathonSubGiftGoals } from "./SubathonGoals";

interface Props {
  numSubGifts: number;
}

export const SubathonCommunitySubGiftProgress = (props: Props) => {
  const { numSubGifts } = props;

  const goals = CommunitySubathonSubGiftGoals;
  let goalToShowIndex = goals.findIndex((goal) => goal.threshold > numSubGifts);
  if (goalToShowIndex === -1) {
    goalToShowIndex = goals.length - 1;
  }

  const previousGoalIndex = goalToShowIndex - 1 ?? 0;
  const previousGoal = goals[previousGoalIndex];
  const previousGoalThreshold = goalToShowIndex > 0 ? previousGoal.threshold : 0;

  const currentGoalThreshold = goals[goalToShowIndex].threshold;
  const percentageToGoal = ((numSubGifts - previousGoalThreshold) / (currentGoalThreshold - previousGoalThreshold)) * 100;

  const label = `${goals[goalToShowIndex].label} (${numSubGifts} / ${currentGoalThreshold} Sub Gifts)`;

  return (
    <ProgressBar
      bgColor="#6498b0"
      labelSize={"18px"}
      width={"400px"}
      height={"32px"}
      labelAlignment="outside"
      customLabel={label}
      completed={percentageToGoal} />
  );
}
