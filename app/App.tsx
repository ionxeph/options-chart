import { createSignal, type Component, onMount, onCleanup } from "solid-js";
import Chart, { ChartItem } from "chart.js/auto";

const App: Component = () => {
  const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement | null>();
  const [chart, setChart] = createSignal<Chart>();

  const init = () => {
    const ctx = canvasRef()?.getContext("2d") as ChartItem;

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [1, 2, 3, 4, 5, 6, 7],
        datasets: [
          {
            label: "My First Dataset",
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            borderColor: "rgb(75, 192, 192)",
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
    </>
  );
};

export default App;
