import {
  createSignal,
  type Component,
  onCleanup,
  onMount,
  untrack,
  createEffect,
  For,
} from 'solid-js';
import Chart, { ChartItem } from 'chart.js/auto';
import { Option, Position } from './types';
import { getChartPoints } from './calculate';
import {
  Box,
  Button,
  Grid,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@suid/material';

const pointColorFn = function (context) {
  if (context.parsed.y === 0) {
    return 'rgb(0, 0, 0)';
  }
  if (context.parsed.y < 0) {
    return 'rgb(255, 0, 0)';
  }

  return 'rgb(0, 255, 0)';
};

const App: Component = () => {
  const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement | null>();
  const [chart, setChart] = createSignal<Chart>();
  const [position, setPosition] = createSignal<Position>({
    price: 10.0,
    amount_owned: 100.0,
    options_bought: [],
    options_sold: [],
  });
  const [sOptions, setSOptions] = createSignal<Option[]>([]);
  const [bOptions, setBOptions] = createSignal<Option[]>([]);

  // when options change
  createEffect(() => {
    const optionsSold = sOptions();
    const optionsBought = bOptions();
    untrack(() => {
      const newPosition: Position = JSON.parse(JSON.stringify(position()));
      newPosition.options_sold = optionsSold;
      newPosition.options_bought = optionsBought;
      setPosition(newPosition);
    });
  });

  // when position changes
  createEffect(() => {
    let chartPoints = getChartPoints(position());
    let labels = chartPoints.labels;
    let data = chartPoints.data;
    untrack(() => {
      if (chart()) {
        chart().data.labels = labels;
        chart().data.datasets[0].data = data;
        chart()!.update();
      }
    });
  });

  onMount(() => {
    const ctx = canvasRef().getContext('2d') as ChartItem;
    let chartPoints = getChartPoints(position());
    let labels = chartPoints.labels;
    let data = chartPoints.data;
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
            showLine: true,
            pointRadius: 10,
            pointHoverRadius: 15,
            // pointBorderColor: pointColorFn,
            // pointBackgroundColor: pointColorFn,
            // borderColor: 'rgb(75, 192, 192)',
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
  });

  onCleanup(() => {
    chart()?.destroy();
  });

  // const mockData: Position = {
  //   price: 15.0,
  //   amount_owned: 100.0,
  //   options_bought: [
  //     {
  //       strike_price: 14.5,
  //       contract_type: 'Put',
  //       amount: 1.0,
  //       premium: 0.25,
  //     },
  //   ],
  //   options_sold: [
  //     {
  //       strike_price: 16.0,
  //       contract_type: 'Call',
  //       amount: 1.0,
  //       premium: 0.15,
  //     },
  //   ],
  // };
  return (
    <>
      <Box
        sx={{
          '& > :not(style)': { m: 1, width: '40%' },
          textAlign: 'center',
        }}
      >
        <TextField
          id="equity-price"
          label="Bought price"
          type="number"
          defaultValue={10}
          onInput={(e: InputEvent) =>
            setPosition({
              ...position(),
              price: Number((e.target as HTMLInputElement).value),
            })
          }
        />
        <TextField
          id="equity-amount"
          label="Amount"
          type="number"
          defaultValue={100}
          onInput={(e: InputEvent) =>
            setPosition({
              ...position(),
              amount_owned: Number((e.target as HTMLInputElement).value),
            })
          }
        />
      </Box>

      <Box
        sx={{
          '& > :not(style)': { m: 1, width: '20%' },
          textAlign: 'center',
        }}
      >
        <For each={sOptions()}>
          {(sOption, i) => (
            <>
              <ToggleButtonGroup
                id={`sold-option-type-${i()}`}
                color="primary"
                // value={position().options_sold[i()].contract_type} // TODO: how to bind this value
                exclusive
                onChange={(_, newType) => {
                  const newPosition: Position = JSON.parse(
                    JSON.stringify(position())
                  );
                  newPosition.options_sold[i()].contract_type = newType;

                  setPosition(newPosition);
                }}
              >
                <ToggleButton value="Call">Call</ToggleButton>
                <ToggleButton value="Put">Put</ToggleButton>
              </ToggleButtonGroup>
              <TextField
                id={`sold-option-strike-${i()}`}
                label="Strike price"
                type="number"
                defaultValue={sOption.strike_price}
                onInput={(e: InputEvent) => {
                  const newPosition: Position = JSON.parse(
                    JSON.stringify(position())
                  );
                  newPosition.options_sold[i()].strike_price = Number(
                    (e.target as HTMLInputElement).value
                  );

                  setPosition(newPosition);
                }}
              />
              <TextField
                id={`sold-option-amount-${i()}`}
                label="Number of contracts"
                type="number"
                defaultValue={sOption.amount}
                onInput={(e: InputEvent) => {
                  const newPosition: Position = JSON.parse(
                    JSON.stringify(position())
                  );
                  newPosition.options_sold[i()].amount = Number(
                    (e.target as HTMLInputElement).value
                  );

                  setPosition(newPosition);
                }}
              />
              <TextField
                id={`sold-option-premium-${i()}`}
                label="Premium (per share)"
                type="number"
                defaultValue={sOption.premium}
                onInput={(e: InputEvent) => {
                  const newPosition: Position = JSON.parse(
                    JSON.stringify(position())
                  );
                  newPosition.options_sold[i()].premium = Number(
                    (e.target as HTMLInputElement).value
                  );

                  setPosition(newPosition);
                }}
              />
            </>
          )}
        </For>
      </Box>
      <Stack
        spacing={2}
        direction="row"
        sx={{
          '& > :not(style)': { width: '25%' },
          m: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => {
            setSOptions([
              ...position().options_sold,
              {
                premium: 0.2,
                contract_type: 'Call',
                amount: 1,
                strike_price: position().price + 1,
              },
            ]);
          }}
        >
          SELL CALL
        </Button>
        <Button variant="outlined">SELL PUT</Button>
        <Button variant="outlined">BUY CALL</Button>
        <Button variant="outlined">BUY PUT</Button>
      </Stack>

      <canvas ref={(el) => setCanvasRef(el)}></canvas>
    </>
  );
};

export default App;
