use serde_json::{json, Value};
use std::collections::HashMap;
use tauri::{api::http, command, AppHandle, Error};

use super::super::util::api::{create_authorized_req, get_api_url, unwrap_data};

#[command]
pub async fn send_message(app: AppHandle, content: String) -> Result<Value, Error> {
    let client = http::ClientBuilder::new().build()?;

    let url = format!("{}/chat/send-message", get_api_url());
    let req = create_authorized_req(&app, "POST", url)?
        .body(http::Body::Json(json!({ "content": content })));
    let res = client.send(req).await?.read().await?;

    let data = unwrap_data(res)?;

    Ok(data)
}

#[command]
pub async fn get_messages_by_chat_id(app: AppHandle, chat_id: String) -> Result<Value, Error> {
    let url = format!("{}/chat/get-messages-by-chat-id", get_api_url(),);

    let client = http::ClientBuilder::new().build()?;
    let mut query = HashMap::new();
    query.insert("chatId".to_string(), chat_id);
    let req = create_authorized_req(&app, "GET", url)?.query(query);
    let res = client.send(req).await?.read().await?;

    let data = unwrap_data(res)?;

    Ok(data)
}

#[command]
pub async fn get_acitve_chat(app: AppHandle) -> Result<Value, Error> {
    let url = format!("{}/chat/get-active-chat", get_api_url());

    let client = http::ClientBuilder::new().build()?;

    let req = create_authorized_req(&app, "GET", url)?;
    let res = client.send(req).await?.read().await?;

    let data = unwrap_data(res)?;

    Ok(data)
}

#[command]
pub async fn get_chats(app: AppHandle) -> Result<Value, Error> {
    let url = format!("{}/chat/get-chats", get_api_url());

    let client = http::ClientBuilder::new().build()?;

    let req = create_authorized_req(&app, "GET", url)?;
    let res = client.send(req).await?.read().await?;

    let data = unwrap_data(res)?;

    Ok(data)
}
