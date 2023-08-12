// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#[macro_use]
extern crate dotenv_codegen;

use tauri::{generate_handler, ActivationPolicy, Builder, Manager, SystemTray, SystemTrayEvent};

mod constants;
mod handlers;
mod util;
use handlers::auth::{clear_api_key, has_api_key, save_api_key, validate_stored_api_key};
use handlers::chat::{
    delete_chat_by_id, get_active_chat, get_chats, get_messages_by_chat_id, send_message,
};
use handlers::config::{change_theme, get_public_config, toggle_always_on_top};
use handlers::context::{
    add_assistant_context_message, add_user_context_message, delete_assistant_context,
    delete_user_context,
};
use handlers::notion::{generate_summary, save_notion_api_key, save_notion_database_id};
use handlers::window::{exit, resize_window, restart, toggle_window};

fn main() {
    let system_tray = SystemTray::new();

    Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                let window = app.get_window("main").unwrap();
                if !window.is_visible().unwrap() {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }
            _ => (),
        })
        .setup(|app| {
            app.set_activation_policy(ActivationPolicy::Accessory);

            util::window::apply_current_always_on_top(&app.app_handle())?;
            util::shortcut::register_shortcuts(&app)?;

            Ok(())
        })
        .invoke_handler(generate_handler![
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
            delete_user_context,
            delete_assistant_context,
            change_theme,
            get_public_config,
            toggle_always_on_top,
            generate_summary,
            save_notion_api_key,
            save_notion_database_id,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
