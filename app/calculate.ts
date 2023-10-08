import { Position, Option, ReturnData } from './types';

export function getChartPoints(position: Position): ReturnData {
  let expectedPricesOfInterest = [position.price];

  for (let bOptions of position.options_bought) {
    expectedPricesOfInterest.push(bOptions.strike_price);
    expectedPricesOfInterest.push(getChartPointOfInterest(bOptions, true));
  }
  for (let sOptions of position.options_sold) {
    expectedPricesOfInterest.push(sOptions.strike_price);
    expectedPricesOfInterest.push(getChartPointOfInterest(sOptions, false));
  }

  // TODO: make two additional data points before and after the range added below smarter
  expectedPricesOfInterest = expectedPricesOfInterest.sort();
  expectedPricesOfInterest.push(
    expectedPricesOfInterest[expectedPricesOfInterest.length - 1] +
      position.price * 0.05
  );
  expectedPricesOfInterest = [
    Math.max(expectedPricesOfInterest[0] - position.price * 0.05, 0.0),
  ].concat(expectedPricesOfInterest);

  let labels: number[] = [];
  let data: number[] = [];

  for (let expectedPrice of expectedPricesOfInterest) {
    labels.push(expectedPrice);
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
