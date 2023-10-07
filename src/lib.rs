pub fn calculate_expected_gain_loss(position: Position, expected_price: f32) -> f32 {
    let mut net_options_premiums: f32 = 0.0;
    for b_options in position.options_bought.iter() {
        net_options_premiums -= b_options.get_premiums();
    }
    for s_options in position.options_sold.iter() {
        net_options_premiums += s_options.get_premiums();
    }
    net_options_premiums + (expected_price - position.price) * position.amount_owned
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
    pub fn get_premiums(&self) -> f32 {
        self.price * self.amount * 100.0
    }
}

pub enum OptionType {
    Call,
    Put,
}
