// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod handlers;
use handlers::auth::{clear_api_key, has_api_key, save_api_key, validate_stored_api_key};
use handlers::window::{resize_window, toggle_window};
use handlers::chat::{send_message, get_messages};
use handlers::context::add_context_message;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            resize_window,
            toggle_window,
            has_api_key,
            save_api_key,
            validate_stored_api_key,
            clear_api_key,
            send_message,
            get_messages,
            add_context_message,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
