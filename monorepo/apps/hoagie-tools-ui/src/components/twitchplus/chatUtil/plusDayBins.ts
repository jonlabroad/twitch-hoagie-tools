import { TwitchPlusStatusEntry } from '@hoagie/streamer-service';
import { get } from 'http';

export const maxPerDayBins = (
  currentMonth: number,
  currentYear: number,
  data: TwitchPlusStatusEntry[]
) => {
  const bins = generateMonthlyBins();
  const values = bins.map((date) => {
    const dayDataPts = getDayData(currentYear, currentMonth, date, data);
    const dateVal = Math.max(
      ...dayDataPts.map((entry) => entry?.value ?? (0 as number)),
      0
    );
    return dateVal;
  });

  return { bins, values };
};

export const latestPerDayBins = (
  currentYear: number,
  currentMonth: number,
  data: TwitchPlusStatusEntry[]
) => {
  const bins = generateMonthlyBins();
  const values = bins.map((date) => {
    const dayDataPts = getDayData(currentYear, currentMonth, date, data);
    const dayDataPtsSorted = dayDataPts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const dateVal = dayDataPtsSorted[dayDataPts.length - 1]?.value ?? 0;
    return dateVal;
  });

  return { bins, values };
};

export const getDayData = (
  year: number,
  month: number,
  dateOfMonth: number,
  data: TwitchPlusStatusEntry[]
) => {
  const dayDataPts =
    data?.filter((entry) => {
      const utcDate = new Date(entry.timestamp).getUTCDate();
      return (
        entry.month === month && entry.year === year && utcDate === dateOfMonth
      );
    }) ?? [];
  return dayDataPts;
};

export const generateMonthlyBins = () => {
  const bins = [...Array(31).keys()].map((i) => i + 1);
  return bins;
}
