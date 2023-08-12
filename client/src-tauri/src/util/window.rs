use tauri::{AppHandle, Error, LogicalPosition, LogicalSize, Manager};

use super::super::constants::AI_RC;
use super::super::handlers::config::ALWAYS_ON_TOP;
use super::data_dir::get_config;

pub fn apply_current_always_on_top(app: &AppHandle) -> Result<(), Error> {
    if let Some(window) = app.get_window("main") {
        if let Some(always_on_top) = get_config(AI_RC, ALWAYS_ON_TOP, app) {
            match always_on_top.as_str() {
                "true" => window.set_always_on_top(true)?,
                "false" => window.set_always_on_top(false)?,
                _ => (),
            }
        }
    }

    Ok(())
}

pub fn resize_window(app: &AppHandle) -> Result<(), Error> {
    if let Some(window) = app.get_window("main") {
        let monitor = window
            .current_monitor()?
            .ok_or(Error::FailedToSendMessage)?;
        let screen_size = monitor.size();
        let screen_position = monitor.position();

        let size = LogicalSize {
            width: (screen_size.width as f64 * 0.15).round() as u32,
            height: ((screen_size.height as f64 / monitor.scale_factor()) - 25.0).round() as u32,
        };
        let position = LogicalPosition {
            x: screen_position.x,
            y: screen_position.y + 25,
        };

        window.set_size(size)?;
        window.set_min_size(Some(size))?;
        window.set_position(position)?;
    }

    Ok(())
}

pub fn toggle_window(app: &AppHandle) -> Result<(), Error> {
    if let Some(window) = app.get_window("main") {
        if window.is_visible()? {
            if window.is_focused()? {
                window.hide()?;
            } else {
                window.set_focus()?;
            }
        } else {
            window.show()?;
            window.set_focus()?;
        }
    }

    Ok(())
}
