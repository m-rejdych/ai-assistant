use serde;
use serde_json::de;
use tauri::{api::http, AppHandle, Error};

use super::api::get_api_url;
use super::data_dir::read_data_dir_file;

#[derive(serde::Deserialize)]
struct ValidateApiKeyData {
    #[serde(rename = "isValid")]
    is_valid: bool,
}

pub fn get_api_key(app: &AppHandle) -> Option<String> {
    let content = match read_data_dir_file(".airc", app) {
        Some(data) => data,
        None => return None,
    };

    let api_key = match content.lines().find(|line| line.starts_with("API_KEY=")) {
        Some(line) => line,
        None => return None,
    };

    match Vec::from_iter(api_key.split("=")).get(1) {
        Some(api_key) => Some(api_key.to_string()),
        None => None,
    }
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
