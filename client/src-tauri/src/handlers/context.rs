use serde_json::json;
use tauri::{api::http, command, AppHandle, Error};

use super::super::util::api::{create_authorized_req, get_api_url};

#[command]
pub async fn add_user_context_message(app: AppHandle, content: String) -> Result<(), Error> {
    let client = http::ClientBuilder::new().build()?;

    let body = http::Body::Json(json!({ "content": content }));
    let url = format!("{}/context/add-user-context-message", get_api_url());

    let req = create_authorized_req(&app, "POST", url)?.body(body);
    let res = client.send(req).await?;

    if res.status().as_u16() >= 400 {
        let data = res.read().await?.data;
        eprintln!("{}", data);
        Err(Error::FailedToSendMessage)
    } else {
        Ok(())
    }
}

#[command]
pub async fn add_assistant_context_message(app: AppHandle, content: String) -> Result<(), Error> {
    let client = http::ClientBuilder::new().build()?;

    let body = http::Body::Json(json!({ "content": content }));
    let url = format!("{}/context/add-assistant-context-message", get_api_url());

    let req = create_authorized_req(&app, "POST", url)?.body(body);
    let res = client.send(req).await?;

    if res.status().as_u16() >= 400 {
        let data = res.read().await?.data;
        eprintln!("{}", data);
        Err(Error::FailedToSendMessage)
    } else {
        Ok(())
    }
}
