use std::fs;
use tauri::{api::file, command, AppHandle, Error};

use super::super::util::{
    auth::{get_api_key, validate_api_key},
    data_dir::{read_data_dir_file, write_data_dir_file},
};

#[command]
pub fn has_api_key(app: AppHandle) -> bool {
    let content = match read_data_dir_file(".airc", &app) {
        Some(data) => data,
        None => return false,
    };

    if content.lines().any(|line| line.starts_with("API_KEY=")) {
        return true;
    }

    false
}

#[command]
pub async fn save_api_key(app: AppHandle, key: String) -> Result<(), Error> {
    let is_valid = validate_api_key(&key).await?;

    if !is_valid {
        return Err(Error::FailedToSendMessage);
    }

    let config_file_content = read_data_dir_file(".airc", &app);

    let api_key = format!("API_KEY={}", &key);

    let content = if let Some(current_config) = config_file_content {
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

    write_data_dir_file(".airc", content, &app)?;

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
    let content = read_data_dir_file(".airc", &app).ok_or(Error::FailedToSendMessage)?;
    let mut lines = Vec::from_iter(content.lines());

    if let Some(pos) = lines.iter().position(|line| line.starts_with("API_KEY=")) {
        lines.remove(pos);
    } else {
        return Ok(());
    }

    write_data_dir_file(".airc", lines.join("\n"), &app)?;

    Ok(())
}
