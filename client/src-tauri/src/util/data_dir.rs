use std::fs;
use std::path::PathBuf;
use tauri::{api::file, AppHandle, Error};

pub fn read_data_dir_file(filename: impl Into<String>, app: &AppHandle) -> Option<String> {
    let config_dir = match get_config_dir(app) {
        Some(dir) => dir,
        None => return None,
    };

    if !config_dir.exists() || !config_dir.is_dir() {
        return None;
    }

    let file = config_dir.join(filename.into());

    if !file.exists() || !file.is_file() {
        return None;
    }

    let content = file::read_string(file).map(|res| Some(res)).unwrap_or(None);

    content
}

pub fn write_data_dir_file(
    filename: impl Into<String>,
    content: String,
    app: &AppHandle,
) -> Result<(), Error> {
    let config_dir = get_config_dir(app).ok_or(Error::FailedToSendMessage)?;

    if !config_dir.exists() {
        create_data_dir(app)?;
    }

    fs::write(config_dir.join(filename.into()), content)?;

    Ok(())
}

pub fn create_data_dir(app: &AppHandle) -> Result<(), Error> {
    let config_dir = app
        .path_resolver()
        .app_local_data_dir()
        .ok_or(Error::FailedToSendMessage)?;

    if config_dir.exists() {
        return Ok(());
    }

    fs::create_dir(config_dir)?;

    Ok(())
}

fn get_config_dir(app: &AppHandle) -> Option<PathBuf> {
    app.path_resolver().app_local_data_dir()
}
