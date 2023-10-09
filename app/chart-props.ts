export const getBaseChart = (data, labels) => ({
  data: {
    labels: labels,
    datasets: [
      {
        type: 'scatter',
        label: 'net gain-loss',
        data: data,
        tension: 0,
        yAxisID: 'yAxis',
        showLine: true,
        pointRadius: 10,
        pointHoverRadius: 15,
        borderWidth: 4,
        pointBorderWidth: 1,
        borderColor: '#90caf9',
        backgroundColor: '#90caf9',
      },
    ],
  },
  options: {
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      yAxis: {
        grid: {
          color: 'rgba(211, 211, 211, 0.25)',
          lineWidth: function (context) {
            if (context.tick.value === 0) {
              return 6;
            } else {
              return 1;
            }
          },
        },
      },
    },
  },
});
