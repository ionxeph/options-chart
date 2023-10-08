use axum::{http::StatusCode, response::IntoResponse, Json};

use crate::{calculate::calculate_expected_gain_loss, models::Position};

pub async fn get_chart_points(
    Json(position): Json<Position>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    println!("{}", position.amount_owned);
    Ok((
        StatusCode::OK,
        Json(calculate_expected_gain_loss(position, 10.0)),
    ))
}
