use serde;
use serde_json::de;
use std::fs;
use tauri::{
    api::{file, http},
    command, AppHandle, Error
};

#[derive(serde::Deserialize)]
struct ValidateApiKeyData {
    #[serde(rename = "isValid")]
    is_valid: bool,
}

#[command]
pub fn has_api_key(app: AppHandle) -> bool {
    let config_file = match app.path_resolver().app_local_data_dir() {
        Some(config) => config,
        None => return false,
    };

    if !config_file.exists() || !config_file.is_file() {
        return false;
    }

    let content = match file::read_string(config_file) {
        Ok(res) => res,
        Err(_) => return false,
    };

    if content.lines().any(|line| line.starts_with("API_KEY=")) {
        return true;
    }

    false
}

#[command]
pub async fn save_api_key(app: AppHandle, key: String) -> Result<(), Error> {
    let config_file = app.path_resolver().app_local_data_dir().unwrap();

    let is_valid = validate_api_key(&key).await?;

    let api_key = format!("API_KEY={}", &key);

    if !is_valid {
        return Err(Error::FailedToSendMessage);
    }

    let content = if config_file.exists() {
        let current_config = file::read_string(&config_file)?;
        if current_config.len() == 0 {
            api_key
        } else {
            format!("{}{}", current_config, api_key)
        }
    } else {
        api_key
    };

    fs::write(config_file, content)?;

    Ok(())
}

fn _get_api_key(app: &AppHandle) -> Option<String> {
    let config_file = match app.path_resolver().app_local_data_dir() {
        Some(path) => path,
        None => return None,
    };

    if !config_file.exists() || !config_file.is_file() {
        return None;
    }

    let content = match file::read_string(config_file) {
        Ok(content) => content,
        Err(_) => return None,
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

async fn validate_api_key(api_key: &str) -> Result<bool, Error> {
    let client = http::ClientBuilder::new().build()?;

    let req = http::HttpRequestBuilder::new("GET", "http://localhost:8080/auth/validate-api-key")?
        .header("Authorization", format!("Bearer {}", api_key))?;
    let json = client.send(req).await?.read().await?.data.to_string();

    let ValidateApiKeyData { is_valid } = de::from_str::<ValidateApiKeyData>(&json)?;

    return Ok(is_valid);
}
