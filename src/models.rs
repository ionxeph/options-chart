use serde::{Deserialize, Serialize};

#[derive(Default, Deserialize, Serialize)]
pub struct Position {
    pub price: f32,
    pub options_bought: Vec<Option>,
    pub options_sold: Vec<Option>,
    pub amount_owned: f32,
}

#[derive(Deserialize, Serialize)]
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

#[derive(Deserialize, Serialize)]
pub struct ExerciseResult {
    pub amount_change: f32,
    pub cash_change: f32,
}

#[derive(Deserialize, Serialize)]
pub enum OptionType {
    Call,
    Put,
}
