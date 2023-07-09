use serde::Deserialize;
use std::fmt;
use tauri::{command, AppHandle, Error};

use super::super::util::data_dir::{get_config, insert_config, update_config};

#[derive(Debug, Deserialize)]
pub enum Theme {
    Coffee,
}

impl fmt::Display for Theme {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[command]
pub fn change_theme(app: AppHandle, theme: Theme) -> Result<(), Error> {
    if let Some(_) = get_config(".airc", "THEME", &app) {
        update_config(".airc", "THEME", theme.to_string().as_str(), &app)?;
    } else {
        insert_config(".airc", "THEME", theme.to_string(), &app)?;
    }

    Ok(())
}

#[command]
pub fn get_theme(app: AppHandle) -> Option<String> {
    get_config(".airc", "THEME", &app)
}
