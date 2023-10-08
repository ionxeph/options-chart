import {
  createSignal,
  type Component,
  onMount,
  onCleanup,
  createResource,
} from 'solid-js';
import Chart, { ChartItem } from 'chart.js/auto';
import { ReturnData, Position } from './types';
import { createEffect } from 'solid-js';

const fetchData = async (position: Position): Promise<ReturnData> => {
  const res = await fetch(`http://localhost:3001`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(position),
  });
  const data = await res.json();
  return data;
};

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
  const [chartData] = createResource(mockData, fetchData);
  createEffect(() => {
    let fetchData = chartData();
    let canvas = canvasRef();
    if (fetchData && canvas) {
      // let labels: number[] = [];
      // let data: number[] = [];
      // let lowestY: number = 0,
      //   highestY: number = 0;
      // fetchData.forEach(({ x, y }) => {
      //   labels.push(x);
      //   data.push(y);
      //   lowestY = Math.min(lowestY, y);
      //   highestY = Math.max(highestY, y);
      // });

      let labels = fetchData.labels;
      let data = fetchData.data;
      let lowestY = data[0];
      let highestY = data[data.length - 1];

      const ctx = canvas.getContext('2d') as ChartItem;
      // TODO: figure out scriptable options
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'net gain-loss',
              data: data,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0,
              yAxisID: 'yAxis',
            },
          ],
        },
        options: {
          scales: {
            yAxis: {
              suggestedMax: highestY + mockData.price,
              suggestedMin: lowestY - mockData.price,
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
