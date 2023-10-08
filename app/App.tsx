import {
  createSignal,
  type Component,
  onMount,
  onCleanup,
  createResource,
} from 'solid-js';
import Chart, { ChartItem } from 'chart.js/auto';

const fetchData = async () => {
  const res = await fetch(`http://localhost:3001`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      price: 15.0,
      amount_owned: 100.0,
      options_bought: [
        {
          strike_price: 14.5,
          contract_type: 'Put',
          amount: 1.0,
          price: 0.25,
        },
      ],
      options_sold: [
        {
          strike_price: 16.0,
          contract_type: 'Call',
          amount: 1.0,
          price: 0.15,
        },
      ],
    }),
  });
  const data = await res.json();
  console.log(data);
  return data;
};

const App: Component = () => {
  const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement | null>();
  const [chart, setChart] = createSignal<Chart>();
  const [chartData] = createResource(fetchData);

  const init = () => {
    const ctx = canvasRef()?.getContext('2d') as ChartItem;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [1, 2, 3, 4, 5, 6, 7],
        datasets: [
          {
            label: 'My First Dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0,
          },
        ],
      },
    });
    setChart(chart);
  };

  onMount(() => {
    init();
  });

  onCleanup(() => {
    chart()?.destroy();
  });

  return (
    <>
      <canvas ref={(el) => setCanvasRef(el)}></canvas>
      <div>{JSON.stringify(chartData())}</div>
    </>
  );
};

export default App;
