use options_chart::{calculate_expected_gain_loss, Position};

fn main() {
    let position = Position::no_options(15.0, 500.0);
    println!("{}", calculate_expected_gain_loss(position, 16.0));
}
