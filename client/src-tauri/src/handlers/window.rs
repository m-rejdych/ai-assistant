use tauri::{command, Error, AppHandle};

use super::super::util::window;

#[command]
pub fn resize_window(app: AppHandle) -> Result<(), Error> {
    window::resize_window(&app)?;

    Ok(())
}

#[command]
pub fn toggle_window(app: AppHandle) -> Result<(), Error> {
    window::toggle_window(&app)?;

    Ok(())
}

#[command]
pub fn exit(app: AppHandle) {
    app.exit(0);
}

#[command]
pub fn restart(app: AppHandle) {
     app.restart();
}
