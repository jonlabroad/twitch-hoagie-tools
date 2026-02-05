const validColors = [
  "#FF0000", // Red
  "#0000FF", // Blue
  "#008000", // Green
  "#B22222", // FireBrick
  "#FF7F50", // Coral
  "#9ACD32", // YellowGreen
  "#FF4500", // OrangeRed
  "#2E8B57", // SeaGreen
  "#DAA520", // GoldenRod
  "#D2691E", // Chocolate
  "#5F9EA0", // CadetBlue
  "#1E90FF", // DodgerBlue
  "#FF69B4", // HotPink
  "#8A2BE2", // BlueViolet
  "#00FF7F", // SpringGreen
];

const assignedColors: { [author: string]: string } = {};

export function getColorForAuthor(author: string): string {
  if (assignedColors[author]) {
    return assignedColors[author];
  }

  // Assign a color based on a hash of the author's name
  const hash = Array.from(author).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  );
  const color = validColors[hash % validColors.length];
  assignedColors[author] = color;
  return color;
}
