use serde_json::{Map, Value};
use std::env;
use tauri::{api::http, command, AppHandle, Error};

use super::auth;

#[command]
pub async fn send_message(app: AppHandle, content: String) -> Result<Value, Error> {
    let api_key = auth::get_api_key(&app).ok_or(Error::FailedToSendMessage)?;

    let client = http::ClientBuilder::new().build()?;

    let url = format!(
        "{}/chat/send-message",
        env::var("API_URL").unwrap_or("http://localhost:8080".to_string())
    );

    let mut body_values = Map::new();
    body_values.insert("content".to_string(), Value::String(content));

    let body = Value::Object(body_values);

    let req = http::HttpRequestBuilder::new("POST", url)?
        .header("Authorization", format!("Bearer {}", api_key))?
        .body(http::Body::Json(body));

    let data = client.send(req).await?.read().await?.data;

    Ok(data)
}

#[command]
pub async fn get_messages(app: AppHandle) -> Result<Value, Error> {
    let api_key = auth::get_api_key(&app).ok_or(Error::FailedToSendMessage)?;

    let url = format!(
        "{}/chat/get-messages",
        env::var("API_URL").unwrap_or("http://localhost:8080".to_string())
    );

    let client = http::ClientBuilder::new().build()?;

    let req = http::HttpRequestBuilder::new("GET", url)?
        .header("Authorization", format!("Bearer {}", api_key))?;

    let data = client.send(req).await?.read().await?.data;

    Ok(data)
}
