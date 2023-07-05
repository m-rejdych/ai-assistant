use std::fs;
use tauri::{api::file, command, AppHandle, Error};

use super::super::util::auth::{get_api_key, validate_api_key};

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
    let config_file = app
        .path_resolver()
        .app_local_data_dir()
        .ok_or(Error::FailedToSendMessage)?;

    let is_valid = validate_api_key(&key).await?;

    let api_key = format!("API_KEY={}", &key);

    if !is_valid {
        return Err(Error::FailedToSendMessage);
    }

    let content = if config_file.exists() {
        let current_config = file::read_string(&config_file)?;
        if current_config.len() == 0 {
            api_key
        } else if current_config.ends_with("\n") {
            format!("{}{}", current_config, api_key)
        } else {
            format!("{}\n{}", current_config, api_key)
        }
    } else {
        api_key
    };

    fs::write(config_file, content)?;

    Ok(())
}

#[command]
pub async fn validate_stored_api_key(app: AppHandle) -> bool {
    let api_key = match get_api_key(&app) {
        Some(key) => key,
        None => return false,
    };

    let is_valid = match validate_api_key(&api_key).await {
        Ok(res) => res,
        Err(_) => return false,
    };

    is_valid
}

#[command]
pub fn clear_api_key(app: AppHandle) -> Result<(), Error> {
    let config_file = app
        .path_resolver()
        .app_local_data_dir()
        .ok_or(Error::FailedToSendMessage)?;

    if !config_file.exists() || !config_file.is_file() {
        return Err(Error::FailedToSendMessage);
    }

    let content = file::read_string(&config_file)?;
    let mut lines = Vec::from_iter(content.lines());

    if let Some(pos) = lines.iter().position(|line| line.starts_with("API_KEY=")) {
        lines.remove(pos);
    } else {
        return Ok(());
    }

    fs::write(config_file, lines.join("\n"))?;

    Ok(())
}
