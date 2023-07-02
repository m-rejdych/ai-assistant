use std::env;
use tauri::{api::http, command, AppHandle, Error};
use serde_json::json;

use super::auth::get_api_key;

#[command]
pub async fn add_context_message(app: AppHandle, content: String) -> Result<(), Error> {
    let api_key = get_api_key(&app).ok_or(Error::FailedToSendMessage)?;

    let client = http::ClientBuilder::new().build()?;

    let req_body = http::Body::Json(json!({ "content": content }));

    let req = http::HttpRequestBuilder::new(
        "POST",
        format!(
            "{}/context/add-context-message",
            env::var("API_URL").unwrap_or("http://localhost:8080".to_string())
        ),
    )?.header("Authorization", format!("Bearer {}", api_key))?.body(req_body);

    client.send(req).await?;

    Ok(())
}
