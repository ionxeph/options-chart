use axum::{http::StatusCode, response::IntoResponse, Json};

use crate::{
    calculate::calculate_expected_gain_loss,
    models::{ChartPoint, Position},
};

pub async fn get_chart_points(
    Json(position): Json<Position>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let mut expected_prices_of_interest: Vec<f32> = vec![position.price];
    // TODO: add two additional data points before and after the range added below
    for b_options in position.options_bought.iter() {
        expected_prices_of_interest.push(b_options.strike_price);
        expected_prices_of_interest.push(b_options.get_chart_point_of_interest(true));
    }
    for s_options in position.options_sold.iter() {
        expected_prices_of_interest.push(s_options.strike_price);
        expected_prices_of_interest.push(s_options.get_chart_point_of_interest(false));
    }

    expected_prices_of_interest.sort_by(|a, b| a.partial_cmp(b).unwrap());
    expected_prices_of_interest
        .push(expected_prices_of_interest.last().unwrap() + position.price * 0.05);
    expected_prices_of_interest
        .push((expected_prices_of_interest[0] - position.price * 0.05).max(0.0));
    expected_prices_of_interest.sort_by(|a, b| a.partial_cmp(b).unwrap());

    let mut chart_points: Vec<ChartPoint> = Vec::with_capacity(expected_prices_of_interest.len());

    for expected_price in expected_prices_of_interest.iter() {
        chart_points.push(ChartPoint {
            x: *expected_price,
            y: calculate_expected_gain_loss(&position, *expected_price),
        });
    }

    Ok((StatusCode::OK, Json(chart_points)))
}
