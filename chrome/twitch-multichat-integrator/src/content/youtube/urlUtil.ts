export const getYoutubeVideoIdFromUrl = (url: string): string | null => {
  const urlObj = new URL(url);
  const videoId = urlObj.searchParams.get("v");

  return videoId;
};
