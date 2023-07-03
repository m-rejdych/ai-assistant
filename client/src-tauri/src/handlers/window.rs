use tauri::{command, Error, LogicalPosition, LogicalSize, Window};

#[command]
pub fn resize_window(window: Window) -> Result<(), Error> {
    let monitor = window
        .current_monitor()?
        .ok_or(Error::FailedToSendMessage)?;
    let screen_size = monitor.size();
    let screen_position = monitor.position();

    window.set_size(LogicalSize {
        width: (screen_size.width as f64 * 0.15).round() as u32,
        height: ((screen_size.height as f64 / monitor.scale_factor()) - 25.0).round() as u32,
    })?;
    window.set_position(LogicalPosition {
        x: screen_position.x,
        y: screen_position.y + 25,
    })?;
    window.show()?;

    Ok(())
}

#[command]
pub fn toggle_window(window: Window) -> Result<(), Error> {
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

    Ok(())
}
