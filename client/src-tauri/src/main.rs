// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod handlers;
use handlers::window::{resize_window, toggle_window};
use handlers::api::{has_api_key, save_api_key};


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
