use base64::Engine;
use base64::engine::general_purpose::STANDARD as BASE64;
use reqwest::Client;
use super::types::{ChampSelectSession, CurrentSummoner, LcuCredentials};

/// Build an HTTP client that accepts self-signed certs (LCU uses one)
fn build_client() -> Result<Client, reqwest::Error> {
    Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
}

/// Build Basic auth header value
fn auth_header(creds: &LcuCredentials) -> String {
    let encoded = BASE64.encode(format!("riot:{}", creds.password));
    format!("Basic {}", encoded)
}

/// Base URL for LCU REST API
fn base_url(creds: &LcuCredentials) -> String {
    format!("https://127.0.0.1:{}", creds.port)
}

/// Fetch champion select session
pub async fn fetch_champion_select(creds: &LcuCredentials) -> Result<ChampSelectSession, String> {
    let client = build_client().map_err(|e| e.to_string())?;
    let url = format!("{}/lol-champ-select/v1/session", base_url(creds));

    let resp = client
        .get(&url)
        .header("Authorization", auth_header(creds))
        .send()
        .await
        .map_err(|e| format!("LCU request failed: {}", e))?;

    if !resp.status().is_success() {
        return Err(format!("LCU returned status {}", resp.status()));
    }

    resp.json::<ChampSelectSession>()
        .await
        .map_err(|e| format!("Failed to parse champion select: {}", e))
}

/// Fetch current summoner info
pub async fn fetch_current_summoner(creds: &LcuCredentials) -> Result<CurrentSummoner, String> {
    let client = build_client().map_err(|e| e.to_string())?;
    let url = format!("{}/lol-summoner/v1/current-summoner", base_url(creds));

    let resp = client
        .get(&url)
        .header("Authorization", auth_header(creds))
        .send()
        .await
        .map_err(|e| format!("LCU request failed: {}", e))?;

    if !resp.status().is_success() {
        return Err(format!("LCU returned status {}", resp.status()));
    }

    resp.json::<CurrentSummoner>()
        .await
        .map_err(|e| format!("Failed to parse summoner: {}", e))
}
