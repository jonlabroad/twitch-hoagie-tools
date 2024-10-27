interface SubathonGoal {
  threshold: number;
  label: string;
}

/*
50 Music Commentary
75 Sing Upside Down
100 Snack and Dnace
125 Freewrite
150 Hit Record, Make a Post
175 Blindfold
200 Originals and Improv Only Stream
250 ALY EATS ON STREAM
300 Clown Lips
*/

export const CommunitySubathonSubGiftGoals: SubathonGoal[] = [
  { threshold: 50, label: "Music Commentary" },
  { threshold: 75, label: "Sing Upside Down" },
  { threshold: 100, label: "Snack and Dance" },
  { threshold: 125, label: "Freewrite" },
  { threshold: 150, label: "Hit Record, Make a Post" },
  { threshold: 175, label: "Blindfold" },
  { threshold: 200, label: "Originals and Improv Only Stream" },
  { threshold: 250, label: "ALY EATS ON STREAM" },
  { threshold: 300, label: "Clown Lips" },
];

/*
100 5th Hour!
200 Wear a Wig
300 Change Wig
400 8 Hour Stream!
500 Milton Roams Freeee!!
666 Piano Power Hour
*/
export const CommunitySubathonTipGoals: SubathonGoal[] = [
  { threshold: 100, label: "5th Hour!" },
  { threshold: 200, label: "Wear a Wig" },
  { threshold: 300, label: "Change Wig" },
  { threshold: 400, label: "8 Hour Stream!" },
  { threshold: 500, label: "Milton Roams Freeee!!" },
  { threshold: 666, label: "Piano Power Hour" },
];
