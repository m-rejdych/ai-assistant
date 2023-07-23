use serde_json::{json, Value};
use tauri::{api::http, command, AppHandle, Error};

use super::super::util::api::{create_authorized_req, get_api_url, unwrap_data};

#[command]
pub async fn generate_summary(app: AppHandle, url: String) -> Result<Value, Error> {
    let client = http::ClientBuilder::new().build()?;

    let body = http::Body::Json(json!({ "url": url }));
    let req = create_authorized_req(&app, "POST", get_api_url())?.body(body);

    let data = unwrap_data(client.send(req).await?.read().await?)?;

    Ok(data)
}
