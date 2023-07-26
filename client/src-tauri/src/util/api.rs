use serde_json::Value;
use tauri::{api::http, AppHandle, Error};

use super::auth::get_api_key;

pub fn get_api_url() -> &'static str {
    dotenv!("API_URL")
}

pub fn create_authorized_req(
    app: &AppHandle,
    method: impl Into<String>,
    url: impl Into<String>,
) -> Result<http::HttpRequestBuilder, Error> {
    let api_key = get_api_key(&app).ok_or(Error::FailedToSendMessage)?;

    let req = http::HttpRequestBuilder::new(method, url.into())?.header(
        "Authorization",
        format!("Bearer {}", api_key),
    )?;

    Ok(req)
}

pub async fn unwrap_data(
    response : http::Response,
) -> Result<Value, Error> {
    if response.status().as_u16() >= 400 {
        eprintln!("{:?}", response);
        Err(Error::FailedToSendMessage)
    } else {
        let http::ResponseData { data, .. } = response.read().await?;
        Ok(data)
    }
}
