use std::fs;
use std::path::PathBuf;
use tauri::{api::file, AppHandle, Error};

fn read_config_file(filename: &str, app: &AppHandle) -> Option<String> {
    let config_dir = match get_config_dir(app) {
        Some(dir) => dir,
        None => return None,
    };

    if !config_dir.exists() || !config_dir.is_dir() {
        return None;
    }

    let file = config_dir.join(filename);

    if !file.exists() || !file.is_file() {
        return None;
    }

    let content = file::read_string(file).map(|res| Some(res)).unwrap_or(None);

    content
}

fn write_config_file(filename: &str, content: String, app: &AppHandle) -> Result<(), Error> {
    let config_dir = get_config_dir(app).ok_or(Error::FailedToSendMessage)?;

    if !config_dir.exists() {
        create_data_dir(app)?;
    }

    fs::write(config_dir.join(filename), content)?;

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

pub fn insert_config(filename: &str, config_name: &str, config_content: String, app: &AppHandle) -> Result<(), Error> {
    let config_file_content = read_config_file(filename, app);

    let new_config = format!("{}={}", config_name, config_content);

    let content = if let Some(current_config) = config_file_content {
        if current_config.len() == 0 {
            new_config
        } else if current_config.ends_with("\n") {
            format!("{}{}", current_config, new_config)
        } else {
            format!("{}\n{}", current_config, new_config)
        }
    } else {
        new_config
    };

    write_config_file(filename, content, app)?;

    Ok(())
}

pub fn remove_config(filename: &str, config_name: &str, app: &AppHandle) -> Result<(), Error> {
    let config_file_content = read_config_file(filename, app).ok_or(Error::FailedToSendMessage)?;

    let mut lines = Vec::from_iter(config_file_content.lines());

    if let Some(pos) = lines
        .iter()
        .position(|line| line.starts_with(format!("{}=", config_name).as_str()))
    {
        lines.remove(pos);
    } else {
        return Ok(());
    }

    write_config_file(filename, lines.join("\n"), app)?;

    Ok(())
}

pub fn get_config(filename: &str, config_name: &str, app: &AppHandle) -> Option<String> {
    let content = match read_config_file(filename, app) {
        Some(data) => data,
        None => return None,
    };

    let config_line = match content
        .lines()
        .find(|line| line.starts_with(format!("{}=", config_name).as_str()))
    {
        Some(line) => line,
        None => return None,
    };

    let splitted_config = Vec::from_iter(config_line.split("="));

    splitted_config.get(1).map(|res| res.to_string())
}

pub fn update_config(
    filename: &str,
    config_name: &str,
    config_content: &str,
    app: &AppHandle,
) -> Result<(), Error> {
    let content = read_config_file(filename, app).ok_or(Error::FailedToSendMessage)?;

    let mut lines = Vec::from_iter(content.lines());

    if let Some(pos) = lines
        .iter()
        .position(|line| line.starts_with(format!("{}=", config_name).as_str()))
    {
        if let Some(config) = lines.get_mut(pos) {
            *config = format!("{}={}", config_name, config_content).as_str();
        } else {
            return Err(Error::FailedToSendMessage);
        }
    } else {
        return Err(Error::FailedToSendMessage);
    }

    Ok(())
}

fn get_config_dir(app: &AppHandle) -> Option<PathBuf> {
    app.path_resolver().app_local_data_dir()
}
