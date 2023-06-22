// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use tauri::{api::file, command, AppHandle, LogicalPosition, LogicalSize, Window};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            resize_window,
            toggle_window,
            has_api_key,
            save_api_key,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[command]
fn resize_window(window: Window) {
    let monitor = window.current_monitor().unwrap().unwrap();
    let screen_size = monitor.size();
    let screen_position = monitor.position();

    window
        .set_size(LogicalSize {
            width: (screen_size.width as f64 * 0.15).round() as u32,
            height: screen_size.height - 25,
        })
        .unwrap();
    window
        .set_position(LogicalPosition {
            x: screen_position.x,
            y: screen_position.y,
        })
        .unwrap();
    window.show().unwrap();
}

#[command]
fn toggle_window(window: Window) {
    if window.is_visible().unwrap() {
        if window.is_focused().unwrap() {
            window.hide().unwrap();
        } else {
            window.set_focus().unwrap();
        }
    } else {
        window.show().unwrap();
        window.set_focus().unwrap();
    }
}

#[command]
fn has_api_key(app: AppHandle) -> bool {
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

    return false;
}

#[command]
fn save_api_key(app: AppHandle, key: String) {
    let config_file = app.path_resolver().app_local_data_dir().unwrap();

    let api_key = format!("API_KEY={}", &key);
    let content = if config_file.exists() {
        let current_config = file::read_string(&config_file).unwrap();
        if current_config.len() == 0 {
            api_key
        } else {
            format!("{}{}", current_config, api_key)
        }
    } else {
        api_key
    };

    fs::write(config_file, content).unwrap();
}

fn get_api_key(app: &AppHandle) -> Option<String> {
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
