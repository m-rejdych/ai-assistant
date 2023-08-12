use tauri::{App, AppHandle, Error, GlobalShortcutManager};

use super::window::{resize_window, toggle_window};

const TOGGLE_KEY: &'static str = "Alt+Shift+Ctrl+A";
const RESIZE_KEY: &'static str = "Alt+Shift+Ctrl+S";

type Cmd = fn(&AppHandle) -> Result<(), Error>;

fn register_shortcut(shortcut: &str, cmd: Cmd, app: &App) -> Result<(), Error> {
    let mut manager = app.global_shortcut_manager();
    let handle = app.handle();

    if !manager.is_registered(shortcut)? {
        manager.register(shortcut, move || {
            cmd(&handle).unwrap_or(());
        })?;
    }

    Ok(())
}

pub fn register_shortcuts(app: &App) -> Result<(), Error> {
    register_shortcut(TOGGLE_KEY, toggle_window, app)?;
    register_shortcut(RESIZE_KEY, resize_window, app)?;
    // POSSIBLY ONE DAY I'LL MAKE IT WORK
    // register_shortcut(GENERATE_SUMMARY_KEY, generate_summary, app)?;

    Ok(())
}
