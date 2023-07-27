use serde_json::{json, Value};
use tauri::{api::http, command, AppHandle, ClipboardManager, Error};

use super::super::constants::AI_RC;
use super::super::util::api::{create_authorized_req, get_api_url, unwrap_data};
use super::super::util::data_dir::{get_config, insert_config, update_config};
use super::super::util::notification::notify_when_visible;

const NOTION_API_KEY: &'static str = "NotionApiKey";
const NOTION_DATABASE_ID: &'static str = "NotionDatabaseId";

#[command]
pub async fn generate_summary(app: AppHandle, url: Option<String>) -> Result<Value, Error> {
    notify_when_visible(&app, "Generating summary...")?;

    let client = http::ClientBuilder::new().build()?;

    let url = url
        .or_else(|| match app.clipboard_manager().read_text() {
            Ok(text) => text,
            Err(_) => None,
        })
        .ok_or(Error::FailedToSendMessage)?;

    let notion_api_key =
        get_config(AI_RC, NOTION_API_KEY, &app).ok_or(Error::FailedToSendMessage)?;

    let notion_database_id =
        get_config(AI_RC, NOTION_DATABASE_ID, &app).ok_or(Error::FailedToSendMessage)?;

    let api_url = format!("{}/notion/generate-summary", get_api_url());
    let body = http::Body::Json(json!({ "url": url, "databaseId": notion_database_id }));
    let req = create_authorized_req(&app, "POST", api_url)?
        .header("Notion-Authorization", format!("Bearer {}", notion_api_key))?
        .body(body);

    let res = client.send(req).await?;
    let data = unwrap_data(res).await?;

    notify_when_visible(&app, "Summary created")?;

    Ok(data)
}

#[command]
pub fn save_notion_api_key(app: AppHandle, notion_api_key: String) -> Result<(), Error> {
    if let Some(_) = get_config(AI_RC, NOTION_API_KEY, &app) {
        update_config(AI_RC, NOTION_API_KEY, &notion_api_key, &app)?;
    } else {
        insert_config(AI_RC, NOTION_API_KEY, &notion_api_key, &app)?;
    }

    Ok(())
}

#[command]
pub fn save_notion_database_id(app: AppHandle, database_id: String) -> Result<(), Error> {
    if let Some(_) = get_config(AI_RC, NOTION_DATABASE_ID, &app) {
        update_config(AI_RC, NOTION_DATABASE_ID, &database_id, &app)?;
    } else {
        insert_config(AI_RC, NOTION_DATABASE_ID, &database_id, &app)?;
    }

    Ok(())
}
