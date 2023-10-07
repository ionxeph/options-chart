use axum::{routing::get, Router};
use tower_http::cors::CorsLayer;

mod calculate;
mod controllers;
mod models;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(controllers::get_chart_points))
        .layer(CorsLayer::permissive());

    let addr = std::net::SocketAddr::from(([127, 0, 0, 1], 3001));
    println!("starting on port: 3001");
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .expect("failed to start server");
}
