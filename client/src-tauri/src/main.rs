// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod handlers;
use handlers::api::{clear_api_key, has_api_key, save_api_key, validate_stored_api_key};
use handlers::window::{resize_window, toggle_window};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            resize_window,
            toggle_window,
            has_api_key,
            save_api_key,
            validate_stored_api_key,
            clear_api_key,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
