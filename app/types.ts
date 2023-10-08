export type Position = {
  price: number;
  options_bought: Option[];
  options_sold: Option[];
  amount_owned: number;
};

export type Option = {
  contract_type: string;
  strike_price: number;
  premium: number; // assume per unit, each contract has 100 units
  amount: number;
};

export type ExerciseResult = {
  amount_change: number;
  cash_change: number;
};

export type ChartPoint = {
  x: number;
  y: number;
};
