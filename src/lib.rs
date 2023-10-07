pub fn calculate_expected_gain_loss(position: Position, expected_price: f32) -> f32 {
    let cost_basis = position.price * position.amount_owned;
    let mut amount_still_owned = position.amount_owned;

    let mut net_options_premiums: f32 = 0.0;
    let mut net_options_proceedings: f32 = 0.0;
    for b_options in position.options_bought.iter() {
        net_options_premiums -= b_options.premiums();
        if b_options.should_exercise(expected_price) {
            let txn_result = b_options.exercise();
            amount_still_owned += txn_result.amount_change;
            net_options_proceedings += txn_result.cash_change;
        }
    }
    for s_options in position.options_sold.iter() {
        net_options_premiums += s_options.premiums();
        if s_options.should_exercise(expected_price) {
            let txn_result = s_options.exercise();
            amount_still_owned -= txn_result.amount_change;
            net_options_proceedings -= txn_result.cash_change;
        }
    }

    net_options_premiums + net_options_proceedings + amount_still_owned * expected_price
        - cost_basis
}

#[derive(Default)]
pub struct Position {
    pub price: f32,
    pub options_bought: Vec<Option>,
    pub options_sold: Vec<Option>,
    pub amount_owned: f32,
}

impl Position {
    pub fn no_options(price: f32, amount_owned: f32) -> Self {
        Position {
            price,
            amount_owned,
            ..Default::default()
        }
    }
}

pub struct Option {
    pub contract_type: OptionType,
    pub strike_price: f32,
    pub price: f32, // assume per unit, each contract has 100 units
    pub amount: f32,
}

impl Option {
    pub fn premiums(&self) -> f32 {
        self.price * self.amount * 100.0
    }

    pub fn exercise(&self) -> ExerciseResult {
        match self.contract_type {
            OptionType::Call => ExerciseResult {
                amount_change: self.amount * 100.0,
                cash_change: -self.strike_price * self.amount * 100.0,
            },
            OptionType::Put => ExerciseResult {
                amount_change: -self.amount * 100.0,
                cash_change: self.strike_price * self.amount * 100.0,
            },
        }
    }

    pub fn should_exercise(&self, expected_price: f32) -> bool {
        match self.contract_type {
            OptionType::Call => self.strike_price < expected_price,
            OptionType::Put => self.strike_price > expected_price,
        }
    }
}

pub struct ExerciseResult {
    amount_change: f32,
    cash_change: f32,
}

pub enum OptionType {
    Call,
    Put,
}
