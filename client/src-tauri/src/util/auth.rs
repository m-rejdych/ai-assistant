use serde;
use serde_json::de;
use tauri::{api::http, AppHandle, Error};

use super::api::get_api_url;
use super::data_dir::get_config;

#[derive(serde::Deserialize)]
struct ValidateApiKeyData {
    #[serde(rename = "isValid")]
    is_valid: bool,
}

pub fn get_api_key(app: &AppHandle) -> Option<String> {
    get_config(".airc", "ApiKey", app)
}

pub async fn validate_api_key(api_key: &str) -> Result<bool, Error> {
    let client = http::ClientBuilder::new().build()?;

    let url = format!("{}/auth/validate-api-key", get_api_url());

    let req = http::HttpRequestBuilder::new("GET", url)?
        .header("Authorization", format!("Bearer {}", api_key))?;
    let http::ResponseData { data, status, .. } = client.send(req).await?.read().await?;

    if status >= 400 {
        eprintln!("{}", data);
        Err(Error::FailedToSendMessage)
    } else {
        let ValidateApiKeyData { is_valid } =
            de::from_str::<ValidateApiKeyData>(&data.to_string())?;

        Ok(is_valid)
    }
}
