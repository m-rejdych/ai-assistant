// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod handlers;
mod util;
use handlers::auth::{clear_api_key, has_api_key, save_api_key, validate_stored_api_key};
use handlers::window::{resize_window, toggle_window, exit, restart};
use handlers::chat::{send_message, get_messages_by_chat_id, get_active_chat, get_chats};
use handlers::context::add_context_message;
use handlers::style::{change_theme, get_theme};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            resize_window,
            toggle_window,
            exit,
            restart,
            has_api_key,
            save_api_key,
            validate_stored_api_key,
            clear_api_key,
            send_message,
            get_messages_by_chat_id,
            get_active_chat,
            get_chats,
            add_context_message,
            change_theme,
            get_theme,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
