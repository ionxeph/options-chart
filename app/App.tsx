import {
  createSignal,
  type Component,
  onCleanup,
  onMount,
  untrack,
  createEffect,
  For,
  Show,
} from 'solid-js';
import { createStore } from 'solid-js/store';
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
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@suid/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    // primary: {
    //   main: '#1976d2',
    // },
    // secondary: {
    //   main: '#9c27b0',
    // },
  },
});

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
  const [position, setPosition] = createStore<Position>({
    price: 10.0,
    amount_owned: 100.0,
    options_bought: [],
    options_sold: [],
  });

  // when position changes
  createEffect(() => {
    let chartPoints = getChartPoints(position);
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
    let chartPoints = getChartPoints(position);
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
            borderWidth: 4,
            pointBorderWidth: 1,
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style="max-width: 1024px; margin: 20px; flex: 1">
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
                ...position,
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
                ...position,
                amount_owned: Number((e.target as HTMLInputElement).value),
              })
            }
          />
        </Box>

        <Show when={position.options_sold.length > 0}>
          <Box
            sx={{
              '& > :not(style)': { m: 1, width: '20%' },
            }}
          >
            <Typography variant="body1">Options sold</Typography>
            <For each={position.options_sold}>
              {(sOption, i) => (
                <>
                  <ToggleButtonGroup
                    id={`sold-option-type-${i()}`}
                    color="primary"
                    value={sOption.contract_type}
                    exclusive
                    onChange={(_, newType) => {
                      setPosition(
                        'options_sold',
                        i(),
                        'contract_type',
                        newType
                      );
                    }}
                  >
                    <ToggleButton value="Call">Call</ToggleButton>
                    <ToggleButton value="Put">Put</ToggleButton>
                  </ToggleButtonGroup>
                  <TextField
                    id={`sold-option-strike-${i()}`}
                    label="Strike price"
                    type="number"
                    defaultValue={position.price}
                    onInput={(e: InputEvent) => {
                      setPosition(
                        'options_sold',
                        i(),
                        'strike_price',
                        Number((e.target as HTMLInputElement).value)
                      );
                    }}
                  />
                  <TextField
                    id={`sold-option-amount-${i()}`}
                    label="Number of contracts"
                    type="number"
                    defaultValue={1}
                    onInput={(e: InputEvent) => {
                      setPosition(
                        'options_sold',
                        i(),
                        'amount',
                        Number((e.target as HTMLInputElement).value)
                      );
                    }}
                  />
                  <TextField
                    id={`sold-option-premium-${i()}`}
                    label="Premium (per share)"
                    type="number"
                    defaultValue={0.2}
                    onInput={(e: InputEvent) => {
                      setPosition(
                        'options_sold',
                        i(),
                        'premium',
                        Number((e.target as HTMLInputElement).value)
                      );
                    }}
                  />
                </>
              )}
            </For>
          </Box>
        </Show>

        <Show when={position.options_bought.length > 0}>
          <Box
            sx={{
              '& > :not(style)': { m: 1, width: '20%' },
            }}
          >
            <Typography variant="body1">Options bought</Typography>
            <For each={position.options_bought}>
              {(bOption, i) => (
                <>
                  <ToggleButtonGroup
                    id={`bought-option-type-${i()}`}
                    color="primary"
                    value={bOption.contract_type}
                    exclusive
                    onChange={(_, newType) => {
                      setPosition(
                        'options_bought',
                        i(),
                        'contract_type',
                        newType
                      );
                    }}
                  >
                    <ToggleButton value="Call">Call</ToggleButton>
                    <ToggleButton value="Put">Put</ToggleButton>
                  </ToggleButtonGroup>
                  <TextField
                    id={`bought-option-strike-${i()}`}
                    label="Strike price"
                    type="number"
                    defaultValue={position.price}
                    onInput={(e: InputEvent) => {
                      setPosition(
                        'options_bought',
                        i(),
                        'strike_price',
                        Number((e.target as HTMLInputElement).value)
                      );
                    }}
                  />
                  <TextField
                    id={`bought-option-amount-${i()}`}
                    label="Number of contracts"
                    type="number"
                    defaultValue={1}
                    onInput={(e: InputEvent) => {
                      setPosition(
                        'options_bought',
                        i(),
                        'amount',
                        Number((e.target as HTMLInputElement).value)
                      );
                    }}
                  />
                  <TextField
                    id={`bought-option-premium-${i()}`}
                    label="Premium (per share)"
                    type="number"
                    defaultValue={0.2}
                    onInput={(e: InputEvent) => {
                      setPosition(
                        'options_bought',
                        i(),
                        'premium',
                        Number((e.target as HTMLInputElement).value)
                      );
                    }}
                  />
                </>
              )}
            </For>
          </Box>
        </Show>

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
              setPosition('options_sold', (l) => [
                ...l,
                {
                  premium: 0.2,
                  contract_type: 'Call',
                  amount: 1,
                  strike_price: position.price,
                },
              ]);
            }}
          >
            SELL CALL
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setPosition('options_sold', (l) => [
                ...l,
                {
                  premium: 0.2,
                  contract_type: 'Put',
                  amount: 1,
                  strike_price: position.price,
                },
              ]);
            }}
          >
            SELL PUT
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setPosition('options_bought', (l) => [
                ...l,
                {
                  premium: 0.2,
                  contract_type: 'Call',
                  amount: 1,
                  strike_price: position.price,
                },
              ]);
            }}
          >
            BUY CALL
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setPosition('options_bought', (l) => [
                ...l,
                {
                  premium: 0.2,
                  contract_type: 'Put',
                  amount: 1,
                  strike_price: position.price,
                },
              ]);
            }}
          >
            BUY PUT
          </Button>
        </Stack>
        <canvas ref={(el) => setCanvasRef(el)}></canvas>
      </div>
    </ThemeProvider>
  );
};

export default App;
