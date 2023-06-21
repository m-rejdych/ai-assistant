// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{command, LogicalPosition, LogicalSize};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![resize_window, toggle_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[command]
fn resize_window(window: tauri::Window) {
    let monitor = window.current_monitor().unwrap().unwrap();
    let screen_size = monitor.size();
    let screen_position = monitor.position();

    window
        .set_size(LogicalSize {
            width: 500,
            height: screen_size.height,
        })
        .unwrap();
    window
        .set_position(LogicalPosition {
            x: screen_position.x,
            y: screen_position.y,
        })
        .unwrap();
}

#[command]
fn toggle_window(window: tauri::Window) {
    if window.is_visible().unwrap() {
        if window.is_focused().unwrap() {
            window.hide().unwrap();
        } else {
            window.set_focus().unwrap();
        }
    } else {
        window.show().unwrap();
    }
}
