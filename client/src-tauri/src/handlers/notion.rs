use serde_json::{json, Value};
use tauri::{api::http, command, AppHandle, Error};

use super::super::constants::AI_RC;
use super::super::util::api::{create_authorized_req, get_api_url, unwrap_data};
use super::super::util::data_dir::{get_config, insert_config, update_config};

const NOTION_API_KEY: &'static str = "NotionApiKey";
const NOTION_DATABASE_ID: &'static str = "NotionDatabaseId";

#[command]
pub async fn generate_summary(app: AppHandle, url: String) -> Result<Value, Error> {
    let client = http::ClientBuilder::new().build()?;

    let body = http::Body::Json(json!({ "url": url }));
    let req = create_authorized_req(&app, "POST", get_api_url())?.body(body);

    let data = unwrap_data(client.send(req).await?.read().await?)?;

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
