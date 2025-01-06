export interface PlusDataSet {
  dates: number[]
  values: number[]
}

export interface TwitchPlusStatsType {
  current: number,
  totalCurrentDiff: number,
  diffData: {
    date: number[],
    diff: number[]
  },
  ptsGainedPerDay: {
    prev: number[],
    current: number[],
    diff: number[],
    lowEstimate: number[],
    highEstimate: number[],
  },
  prediction: number[],
}

const estimatePlusMinusPerDay = 2;

// Note: Current data must end at the current date (not be padded with zeros)
export const calculateStats = (currentDate: number, currentMonth: PlusDataSet, previousMonth: PlusDataSet): TwitchPlusStatsType => {
  const stats: TwitchPlusStatsType = {
    current: 0,
    totalCurrentDiff: 0,
    diffData: {
      date: [],
      diff: [],
    },
    ptsGainedPerDay: {
      prev: [],
      current: [],
      diff: [],
      lowEstimate: [],
      highEstimate: [],
    },
    prediction: [],
  };

  stats.current = currentMonth.values[currentDate - 1];
  if (currentDate > 1) {
    const yesterday = currentMonth.values[currentDate - 2];
    stats.totalCurrentDiff = yesterday - previousMonth.values[currentDate - 2];
  } else {
    stats.totalCurrentDiff = 0;
  }

  for (let iDate = 0; iDate < 31; iDate++) {
    const prev = previousMonth.values[iDate];
    const prevLast = iDate === 0 ? 0 : previousMonth.values[iDate - 1];
    const prevMonthGained = prev - prevLast;
    stats.ptsGainedPerDay.prev.push(prevMonthGained);
  }

  for (let iDate = 0; iDate < currentMonth.dates.length; iDate++) {
    const curr = currentMonth.values[iDate];
    const prev = previousMonth.values[iDate];

    stats.diffData.diff.push(curr - prev);

    if (iDate < currentDate - 1) {
      const currLast = iDate === 0 ? 0 : currentMonth.values[iDate - 1];
      const prevMonthGained = stats.ptsGainedPerDay.prev[iDate];
      const currMonthGained = curr - currLast;
      stats.ptsGainedPerDay.current.push(currMonthGained);
      stats.ptsGainedPerDay.diff.push(currMonthGained - prevMonthGained);
    } else {
      stats.ptsGainedPerDay.current.push(0);
      stats.ptsGainedPerDay.diff.push(0);
    }
  }

  let estLowTotal = stats.current;
  let estHighTotal = stats.current;
  for (let iDate = 0; iDate < 31; iDate++) {
    if (iDate < currentDate - 1) {
      stats.ptsGainedPerDay.lowEstimate.push(NaN);
      stats.ptsGainedPerDay.highEstimate.push(NaN);

    } else {
      const estLowDiff = Math.max(0, (stats.ptsGainedPerDay.prev[iDate] ?? 0) - estimatePlusMinusPerDay);
      const estHighDiff = (stats.ptsGainedPerDay.prev[iDate] ?? 0) + estimatePlusMinusPerDay;
      stats.ptsGainedPerDay.lowEstimate.push(estLowTotal + estLowDiff);
      stats.ptsGainedPerDay.highEstimate.push(estHighTotal + estHighDiff);
      estLowTotal += estLowDiff;
      estHighTotal += estHighDiff;
    }
  }

  let predictAccum = currentMonth.values[currentDate - 2] ?? 0;
  for (let iDate = 0; iDate < 31; iDate++) {
    if (iDate < currentDate - 1) {
      stats.prediction.push(NaN);

    } else {
      predictAccum += stats.ptsGainedPerDay.prev[iDate];
      stats.prediction.push(predictAccum);
    }
  }

  return stats;
}
