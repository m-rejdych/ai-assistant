use tauri::{command, AppHandle, Error};

use super::super::util::{
    auth::{get_api_key, validate_api_key},
    data_dir::{get_config, insert_config, remove_config},
};

#[command]
pub fn has_api_key(app: AppHandle) -> bool {
    get_config(".airc", "API_KEY", &app).map_or(false, |_| true)
}

#[command]
pub async fn save_api_key(app: AppHandle, key: String) -> Result<(), Error> {
    let is_valid = validate_api_key(&key).await?;

    if !is_valid {
        return Err(Error::FailedToSendMessage);
    }

    insert_config(".airc", "API_KEY", key, &app)?;

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
    remove_config(".airc", "API_KEY", &app)?;

    Ok(())
}
