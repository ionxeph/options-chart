use options_chart::{calculate_expected_gain_loss, Option, OptionType, Position};

#[test]
fn no_options() {
    let position = Position::no_options(15.0, 500.0);
    assert_eq!(calculate_expected_gain_loss(position, 16.0), 500.0);
}

#[test]
fn with_worthless_options() {
    let position = Position {
        price: 15.0,
        amount_owned: 100.0,
        options_bought: vec![Option {
            strike_price: 14.5,
            contract_type: OptionType::Put,
            amount: 1.0,
            price: 0.25,
        }],
        options_sold: vec![Option {
            strike_price: 16.0,
            contract_type: OptionType::Call,
            amount: 1.0,
            price: 0.15,
        }],
    };
    assert_eq!(calculate_expected_gain_loss(position, 15.5), 40.0);
}
