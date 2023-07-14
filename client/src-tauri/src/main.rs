// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#[macro_use]
extern crate dotenv_codegen;

mod handlers;
mod util;
use handlers::auth::{clear_api_key, has_api_key, save_api_key, validate_stored_api_key};
use handlers::chat::{
    delete_chat_by_id, get_active_chat, get_chats, get_messages_by_chat_id, send_message,
};
use handlers::context::{add_user_context_message, add_assistant_context_message};
use handlers::style::{change_theme, get_theme};
use handlers::window::{exit, resize_window, restart, toggle_window};

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
            delete_chat_by_id,
            add_user_context_message,
            add_assistant_context_message,
            change_theme,
            get_theme,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
