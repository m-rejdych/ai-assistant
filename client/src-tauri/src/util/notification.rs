use tauri::{api::notification::Notification, AppHandle, Error, Manager};

fn notify(app: &AppHandle, title: &str) -> Result<(), Error> {
    let id = &app.config().tauri.bundle.identifier;
    Notification::new(id).title(title).show()?;

    Ok(())
}

pub fn notify_when_visible(app: &AppHandle, title: &str) -> Result<(), Error> {
    if let Some(window) = app.get_window("main") {
        if !window.is_visible()? {
            notify(app, title)?;
        }
    }

    Ok(())
}
