import {
  createSignal,
  type Component,
  onCleanup,
  createResource,
  createEffect,
} from 'solid-js';
import Chart, { ChartItem } from 'chart.js/auto';
import { Position } from './types';
import { getChartPoints } from './calculate';

const mockData: Position = {
  price: 15.0,
  amount_owned: 100.0,
  options_bought: [
    {
      strike_price: 14.5,
      contract_type: 'Put',
      amount: 1.0,
      premium: 0.25,
    },
  ],
  options_sold: [
    {
      strike_price: 16.0,
      contract_type: 'Call',
      amount: 1.0,
      premium: 0.15,
    },
  ],
};

const App: Component = () => {
  const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement | null>();
  const [chart, setChart] = createSignal<Chart>();
  const [chartData] = createResource(mockData, getChartPoints);
  createEffect(() => {
    let chartPoints = chartData();
    let canvas = canvasRef();
    if (chartPoints && canvas) {
      let labels = chartPoints.labels;
      let data = chartPoints.data;
      let lowestY = data[0];
      let highestY = data[data.length - 1];

      const pointColorFn = function (context) {
        if (context.parsed.y < 0) {
          return 'rgb(255, 0, 0)';
        }

        return 'rgb(0, 255, 0)';
      };

      const ctx = canvas.getContext('2d') as ChartItem;
      const chart = new Chart(ctx, {
        data: {
          labels: labels,
          datasets: [
            {
              type: 'scatter',
              label: 'net gain-loss',
              data: data,
              tension: 0,
              yAxisID: 'yAxis',
              xAxisID: 'xAxis',
              fill: true,
              pointRadius: 10,
              pointHoverRadius: 15,
              pointBorderColor: pointColorFn,
              pointBackgroundColor: pointColorFn,

              segment: {
                backgroundColor: function (ctx) {
                  if (ctx.p1.parsed.y > 0) {
                    return 'rgba(0, 255, 0, 0.25)';
                  }
                  return 'rgba(255, 0, 0, 0.25)';
                },
                borderColor: function (ctx) {
                  if (ctx.p1.parsed.y > 0) {
                    return 'rgba(0, 255, 0, 0.25)';
                  }
                  return 'rgba(255, 0, 0, 0.25)';
                },
              },
            },
            {
              type: 'line',
              label: 'net gain-loss',
              data: data,
              tension: 0,
              yAxisID: 'yAxis',
              xAxisID: 'xAxis',
              pointRadius: 10,
              pointHoverRadius: 15,
              pointBorderColor: pointColorFn,
              pointBackgroundColor: pointColorFn,
              borderColor: 'rgb(75, 192, 192)',
              // fill: true,
              // segment: {
              //   backgroundColor: function (ctx) {
              //     if (ctx.p1.parsed.y > 0) {
              //       return 'rgba(0, 255, 0, 0.25)';
              //     }
              //     return 'rgba(255, 0, 0, 0.25)';
              //   },
              //   borderColor: function (ctx) {
              //     if (ctx.p1.parsed.y > 0) {
              //       return 'rgba(0, 255, 0, 0.25)';
              //     }
              //     return 'rgba(255, 0, 0, 0.25)';
              //   },
              // },
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
              suggestedMax: highestY + mockData.price,
              suggestedMin: lowestY - mockData.price,
              grid: {
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
      setChart(chart);
    }
  });

  onCleanup(() => {
    chart()?.destroy();
  });

  return (
    <>
      <canvas ref={(el) => setCanvasRef(el)}></canvas>
    </>
  );
};

export default App;
