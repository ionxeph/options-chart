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
import { getBaseChart } from './chart-props';
import './app.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

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
    const chart = new Chart(ctx, getBaseChart(data, labels) as any);
    setChart(chart);
  });

  onCleanup(() => {
    chart()?.destroy();
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div class="grid">
        <div class="stock">
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
        </div>

        <Show when={position.options_sold.length > 0}>
          <div class="options">
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
          </div>
        </Show>

        <Show when={position.options_bought.length > 0}>
          <div class="options">
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
          </div>
        </Show>

        <div class="options-buttons">
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
        </div>
      </div>
      <canvas ref={(el) => setCanvasRef(el)}></canvas>
    </ThemeProvider>
  );
};

export default App;
