use serde_json::{json, Value};
use std::collections::HashMap;
use tauri::{api::http, command, AppHandle, Error};

use super::super::util::api::{create_authorized_req, get_api_url, unwrap_data};

#[command]
pub async fn send_message(
    app: AppHandle,
    content: String,
    chat_id: Option<String>,
) -> Result<Value, Error> {
    let client = http::ClientBuilder::new().build()?;

    let json_body = if let Some(chat_id) = chat_id {
        json!({ "content": content, "chatId": chat_id })
    } else {
        json!({ "content": content })
    };
    let url = format!("{}/chat/send-message", get_api_url());
    let req = create_authorized_req(&app, "POST", url)?.body(http::Body::Json(json_body));
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
pub async fn get_active_chat(app: AppHandle) -> Result<Value, Error> {
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

#[command]
pub async fn delete_chat_by_id(app: AppHandle, chat_id: String) -> Result<(), Error> {
    let url = format!("{}/chat/delete-chat-by-id", get_api_url());

    let client = http::ClientBuilder::new().build()?;

    let mut query = HashMap::new();
    query.insert("id".to_string(), chat_id);

    let req = create_authorized_req(&app, "DELETE", url)?.query(query);

    client.send(req).await?;

    Ok(())
}
