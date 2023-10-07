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

#[test]
fn with_exercised_sold_call_option() {
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
    assert_eq!(calculate_expected_gain_loss(position, 16.5), 90.0);
}

#[test]
fn with_exercised_bought_call_option() {
    let position = Position {
        price: 15.0,
        amount_owned: 100.0,
        options_bought: vec![Option {
            strike_price: 14.5,
            contract_type: OptionType::Call,
            amount: 1.0,
            price: 0.25,
        }],
        ..Position::default()
    };
    assert_eq!(calculate_expected_gain_loss(position, 15.5), 125.0);
}

#[test]
fn with_exercised_sold_put_option() {
    let position = Position {
        price: 15.0,
        amount_owned: 100.0,
        options_sold: vec![Option {
            strike_price: 14.5,
            contract_type: OptionType::Put,
            amount: 1.0,
            price: 0.25,
        }],
        ..Position::default()
    };
    assert_eq!(calculate_expected_gain_loss(position, 13.0), -325.0);
}

#[test]
fn with_exercised_bought_put_option() {
    let position = Position {
        price: 15.0,
        amount_owned: 100.0,
        options_bought: vec![Option {
            strike_price: 14.5,
            contract_type: OptionType::Put,
            amount: 1.0,
            price: 0.25,
        }],
        ..Position::default()
    };
    assert_eq!(calculate_expected_gain_loss(position, 13.0), -75.0);
}

#[test]
fn with_no_equity_owned() {
    let position = Position {
        price: 15.0,
        amount_owned: 0.0,
        options_bought: vec![
            Option {
                strike_price: 14.5,
                contract_type: OptionType::Call,
                amount: 1.0,
                price: 0.75,
            },
            Option {
                strike_price: 13.5,
                contract_type: OptionType::Put,
                amount: 1.0,
                price: 0.05,
            },
        ],
        options_sold: vec![
            Option {
                strike_price: 16.5,
                contract_type: OptionType::Call,
                amount: 1.0,
                price: 0.5,
            },
            Option {
                strike_price: 15.5,
                contract_type: OptionType::Put,
                amount: 1.0,
                price: 0.85,
            },
        ],
    };
    assert_eq!(calculate_expected_gain_loss(position, 13.0), -145.0);
}
