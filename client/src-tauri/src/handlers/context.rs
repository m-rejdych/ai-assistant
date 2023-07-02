use serde_json::json;
use std::env;
use tauri::{api::http, command, AppHandle, Error};

use super::auth::get_api_key;

#[command]
pub async fn add_context_message(app: AppHandle, content: String) -> Result<(), Error> {
    let api_key = get_api_key(&app).ok_or(Error::FailedToSendMessage)?;

    let client = http::ClientBuilder::new().build()?;

    let body = http::Body::Json(json!({ "content": content }));

    let url = format!(
        "{}/context/add-context-message",
        env::var("API_URL").unwrap_or("http://localhost:8080".to_string())
    );

    let req = http::HttpRequestBuilder::new("POST", url)?
        .header("Authorization", format!("Bearer {}", api_key))?
        .body(body);

    let response = client.send(req).await?;

    if response.status().as_u16() >= 400 {
        let data = response.read().await?.data;
        eprintln!("{}", data);
        Err(Error::FailedToSendMessage)
    } else {
        Ok(())
    }
}
