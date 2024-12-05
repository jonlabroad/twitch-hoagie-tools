import { useContext, useEffect } from 'react';
import { useStreamerConfig } from '../../hooks/useStreamerConfig';
import { StateContext } from '../context/StateContextProvider';
import { useTwitchPlusData } from '../../hooks/useTwitchPlusData';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { FlexRow } from '../util/FlexBox';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { LoginContext } from '../context/LoginContextProvider';
import { latestPerDayBins } from './chatUtil/plusDayBins';
import { ConnectionAuthResponseParametersFilterSensitiveLog } from '@aws-sdk/client-eventbridge';
import { linearExtrapolate } from './chatUtil/dataUtil';

ChartJS.register(
  CategoryScale,
  LinearScale,
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

  const currentDate = new Date();
  const currentMonthAt1 = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const { bins, values } = latestPerDayBins(
    currentYear,
    currentMonthAt1,
    plusData ?? []
  );

  const lastMonth1 = currentMonthAt1 === 1 ? 12 : currentMonthAt1 - 1;
  let { bins: binsPrev, values: valuesPrev } = latestPerDayBins(
    currentYear,
    lastMonth1,
    plusData ?? []
  );

  const lastMonthsData =
    plusData?.filter(
      (data) => data.year === currentYear && data.month === lastMonth1
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

  const plusDataSet = {
    labels: bins,
    datasets: [
      {
        label: 'Current',
        data: values,
        borderWidth: 2,
        borderColor: 'rgb(60, 60, 80)',
        backgroundColor: 'rgb(191, 148, 255)',
        tension: 0.1,
      },
      {
        label: usingEstimation ? 'Last Month (estimated)' : 'last Month',
        data: valuesPrev,
        borderWidth: 2,
        borderColor: 'rgb(120, 120, 150)',
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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2">
              Twitch Plus Status
            </Typography>
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
    </Grid>
  );
};
