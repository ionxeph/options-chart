import { Position, Option, ReturnData } from './types';

// TODO: get break-even point
export function getChartPoints(position: Position): ReturnData {
  let expectedPricesOfInterest = [position.price];
  let highest = position.price,
    lowest = position.price;

  for (let bOptions of position.options_bought) {
    let chartInterest = getChartPointOfInterest(bOptions, true);
    expectedPricesOfInterest.push(bOptions.strike_price);
    expectedPricesOfInterest.push(chartInterest);

    highest = Math.max(highest, bOptions.strike_price);
    lowest = Math.min(lowest, bOptions.strike_price);
    highest = Math.max(highest, chartInterest);
    lowest = Math.min(lowest, chartInterest);
  }
  for (let sOptions of position.options_sold) {
    let chartInterest = getChartPointOfInterest(sOptions, false);
    expectedPricesOfInterest.push(sOptions.strike_price);
    expectedPricesOfInterest.push(chartInterest);

    highest = Math.max(highest, sOptions.strike_price);
    lowest = Math.min(lowest, sOptions.strike_price);
    highest = Math.max(highest, chartInterest);
    lowest = Math.min(lowest, chartInterest);
  }

  // TODO: make two additional data points before and after the range added below smarter
  expectedPricesOfInterest.push(highest + position.price * 0.05);
  expectedPricesOfInterest.push(Math.max(lowest - position.price * 0.05, 0.0));
  expectedPricesOfInterest = [...new Set(expectedPricesOfInterest)];
  expectedPricesOfInterest = expectedPricesOfInterest.sort((a, b) => a - b);

  let labels: number[] = [];
  let data: number[] = [];

  for (let expectedPrice of expectedPricesOfInterest) {
    labels.push(
      Number(
        expectedPrice.toLocaleString('en-US', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
          useGrouping: false,
        })
      )
    );
    data.push(calculateExpectedGainLoss(position, expectedPrice));
  }

  return {
    labels,
    data,
  };
}

function calculateExpectedGainLoss(
  position: Position,
  expected_price: number
): number {
  let costBasis = position.price * position.amount_owned;
  let amountStillOwned = position.amount_owned;

  let netPremiums: number = 0.0;
  let netOptionsProceedings: number = 0.0;
  for (let bOptions of position.options_bought) {
    netPremiums -= premiums(bOptions);
    if (shouldExercise(bOptions, expected_price)) {
      let txn_result = exercise(bOptions);
      amountStillOwned += txn_result.amount_change;
      netOptionsProceedings += txn_result.cash_change;
    }
  }
  for (let sOptions of position.options_sold) {
    netPremiums += premiums(sOptions);
    if (shouldExercise(sOptions, expected_price)) {
      let txn_result = exercise(sOptions);
      amountStillOwned -= txn_result.amount_change;
      netOptionsProceedings -= txn_result.cash_change;
    }
  }

  return (
    netPremiums +
    netOptionsProceedings +
    amountStillOwned * expected_price -
    costBasis
  );
}

function premiums(option: Option): number {
  return option.premium * option.amount * 100.0;
}

function exercise(option: Option): {
  amount_change: number;
  cash_change: number;
} {
  if (option.contract_type === 'Call') {
    return {
      amount_change: option.amount * 100.0,
      cash_change: -option.strike_price * option.amount * 100.0,
    };
  } else {
    return {
      amount_change: -option.amount * 100.0,
      cash_change: option.strike_price * option.amount * 100.0,
    };
  }
}

function shouldExercise(option: Option, expected_price: number): boolean {
  if (option.contract_type === 'Call') {
    return option.strike_price < expected_price;
  } else {
    return option.strike_price > expected_price;
  }
}

function getChartPointOfInterest(option: Option, bought: boolean): number {
  if (option.contract_type === 'Call') {
    if (bought) {
      return option.strike_price + option.premium;
    } else {
      return option.strike_price - option.premium;
    }
  } else {
    if (bought) {
      return option.strike_price - option.premium;
    } else {
      return option.strike_price + option.premium;
    }
  }
}
