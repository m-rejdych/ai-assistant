use serde::Deserialize;
use std::fmt;
use tauri::{command, Window, AppHandle, Error};

use super::super::util::data_dir::{get_config, insert_config, update_config};
use super::super::constants::AI_RC;

const THEME: &'static str = "Theme";
const ALWAYS_ON_TOP: &'static str = "AlwaysOnTop";

#[derive(Debug, Deserialize)]
pub enum Config {
    Theme,
    AlwaysOnTop,
    NotionApiKey,
    NotionDatabaseId,
}

#[derive(Debug, Deserialize)]
pub enum Theme {
    Coffee,
    Night,
}

impl fmt::Display for Theme {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl fmt::Display for Config {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[command]
pub fn change_theme(app: AppHandle, theme: Theme) -> Result<(), Error> {
    let value = theme.to_string();

    if let Some(_) = get_config(AI_RC, THEME, &app) {
        update_config(AI_RC, THEME, &value, &app)?;
    } else {
        insert_config(AI_RC, THEME, &value, &app)?;
    }

    Ok(())
}

#[command]
pub fn toggle_always_on_top(app: AppHandle, window: Window) -> Result<(), Error> {
    if let Some(always_on_top) = get_config(AI_RC, ALWAYS_ON_TOP, &app) {
        let new_value = if always_on_top == "true" {
            false
        } else {
            true
        };

        window.set_always_on_top(new_value)?;
        update_config(AI_RC, ALWAYS_ON_TOP, &new_value.to_string(), &app)?;
    } else {
        window.set_always_on_top(true)?;
        insert_config(AI_RC, ALWAYS_ON_TOP, "true", &app)?;
    }

    Ok(())
}

#[command]
pub fn get_public_config(app: AppHandle, config: Config) -> Option<String> {
    get_config(AI_RC, &config.to_string(), &app)
}
