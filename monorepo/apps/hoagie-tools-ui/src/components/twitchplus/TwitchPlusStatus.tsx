import { useContext, useEffect, useMemo, useState } from 'react';
import { useStreamerConfig } from '../../hooks/useStreamerConfig';
import { StateContext } from '../context/StateContextProvider';
import { useTwitchPlusData } from '../../hooks/useTwitchPlusData';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ChartConfiguration,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  BarElement,
  BarController,
} from 'chart.js';
import { FlexCol, FlexRow } from '../util/FlexBox';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { LoginContext } from '../context/LoginContextProvider';
import { latestPerDayBins } from './chatUtil/plusDayBins';
import { linearExtrapolate } from './chatUtil/dataUtil';
import { calculateStats } from './StatsCalculator';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineController,
  BarController,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface IProps {}

export const TwitchPlusStatus = (props: IProps) => {
  const { state: appState } = useContext(StateContext);
  const { state: loginState } = useContext(LoginContext);

  const [config] = useStreamerConfig(appState.streamerId);
  const [plusData] = useTwitchPlusData(appState.streamerId, 30);

  const [showPreviousMonth, setShowPreviousMonth] = useState(true);

  const currentDate = new Date();
  const currentMonthAt1 = currentDate.getUTCMonth() + 1;
  const currentYear = currentDate.getUTCFullYear();
  const currentDayOfMonth = currentDate.getUTCDate();

  const { bins, values } = latestPerDayBins(
    currentYear,
    currentMonthAt1,
    plusData ?? []
  );

  const lastMonth1 = currentMonthAt1 === 1 ? 12 : currentMonthAt1 - 1;
  const lastYear = currentMonthAt1 === 1 ? currentYear - 1 : currentYear;
  let { bins: binsPrev, values: valuesPrev } = latestPerDayBins(
    lastYear,
    lastMonth1,
    plusData ?? []
  );

  const lastMonthsData =
    plusData?.filter(
      (data) => data.year === lastYear && data.month === lastMonth1
    ) ?? [];
  const plusGoal = config?.twitchPlus.goal ?? 100;

  let usingEstimation = false;
  if (lastMonthsData.length <= 1) {
    // Just a placeholder until we have a full month of data, extrapolate from the last day
    const daysInLastMonth = 30;
    const lastMonthsEndValue =
      lastMonthsData
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
        .pop()?.value ?? 0;
    valuesPrev = binsPrev.map((bin) =>
      bin > daysInLastMonth
        ? 0
        : linearExtrapolate([0, daysInLastMonth], [0, lastMonthsEndValue], bin)
    );
    usingEstimation = true;
  }

  // Stats
  const stats = useMemo(() => calculateStats(currentDayOfMonth, { dates: bins, values: values }, { dates: binsPrev, values: valuesPrev }),
    [currentDayOfMonth, bins, values, binsPrev, valuesPrev]
  );

  const plusDataSet = {
    labels: bins,
    datasets: [
      {
        label: 'Current',
        data: values,
        borderWidth: 2,
        borderColor: 'rgb(60, 60, 80)',
        backgroundColor: 'rgb(191, 148, 255)',
      },
      {
        type: 'line' as any,
        label: 'Prediction Low',
        data: stats.ptsGainedPerDay.lowEstimate,
        borderWidth: 2,
        borderColor: 'red',
        backgroundColor: 'red',
        borderDash: [5, 5],
        pointStyle: "cross" as any,
      },
      {
        type: 'line' as any,
        label: 'Prediction High',
        data: stats.ptsGainedPerDay.highEstimate,
        borderWidth: 2,
        borderColor: 'green',
        backgroundColor: 'green',
        borderDash: [5, 5],
        pointStyle: "cross" as any,
      },
      {
        type: 'line' as any,
        label: 'Prediction',
        data: stats.prediction,
        borderWidth: 2,
        borderColor: 'grey',
        backgroundColor: 'grey',
        borderDash: [5, 5],
        pointStyle: "cross" as any,
      },
    ],
  };

  if (showPreviousMonth) {
    plusDataSet.datasets.push({
      label: usingEstimation ? 'Last Month (estimated)' : 'last Month',
      data: valuesPrev,
      borderWidth: 2,
      borderColor: 'rgb(120, 120, 150)',
    } as any);
  }

  const diffDataSet = {
    labels: bins,
    datasets: [
      {
        label: 'Pts Gained',
        data: stats.ptsGainedPerDay.diff.slice(0, currentDayOfMonth).map((val) => Math.max(val, 0)),
        borderWidth: 2,
        borderColor: 'green',
        backgroundColor: 'green',
        tension: 0.1,
      },
      {
        label: 'Pts Lost',
        data: stats.ptsGainedPerDay.diff.slice(0, currentDayOfMonth).map((val) => Math.min(val, 0)),
        borderWidth: 2,
        borderColor: 'red',
        backgroundColor: 'red',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Twitch Plus Points',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Day of Month',
        },
        min: 1,
        max: 31,
      },
      y: {
        title: {
          display: true,
          text: 'Plus Points',
        },
        min: 0,
        suggestedMax: plusGoal,
      },
    },
  };

  const diffChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Points Difference Per Day',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Day of Month',
        },
        min: 1,
        max: 31,
      },
      y: {
        title: {
          display: true,
          text: 'Plus Points',
        },
        min: -20,
        max: 20,
      },
    },
  }

  if (!loginState.isLoggedIn) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2">
            Twitch Plus Status
          </Typography>
          <Typography>Please login to view Twitch Plus Status</Typography>
        </CardContent>
      </Card>
    );
  }

  let diffText = "(";
  diffText += stats.totalCurrentDiff !== 0 ? (stats.totalCurrentDiff > 0 ? '+' : '') : '';
  diffText += Math.round(stats.totalCurrentDiff) + ")";

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" component="h2">
          Twitch Plus Status
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Card>
          <CardContent>
            <FlexRow
              style={{
                justifyContent: 'center',
              }}
            >
              <Bar options={chartOptions} data={plusDataSet} />
            </FlexRow>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={1}>
        <Card>
          <CardContent>
            <FlexCol justifyContent={"center"} alignItems="center">
            <Typography variant="h6" component="h2">
              Current
            </Typography>
            <FlexRow alignItems="center">
              <Typography marginRight={1} fontSize={32}>{stats.current}</Typography>
              <Typography fontSize={18} color={stats.totalCurrentDiff > 0 ? 'green' : 'red'}>{diffText}</Typography>
            </FlexRow>
            </FlexCol>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Card>
          <CardContent>
            <FlexRow
              style={{
                justifyContent: 'center',
              }}
            >
              <Bar options={diffChartOptions} data={diffDataSet} />
            </FlexRow>
          </CardContent>
        </Card>
      </Grid>
      </Grid>
  );
};
