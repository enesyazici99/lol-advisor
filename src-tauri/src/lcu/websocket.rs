use base64::Engine;
use base64::engine::general_purpose::STANDARD as BASE64;
use futures_util::{SinkExt, StreamExt};
use native_tls::TlsConnector;
use tauri::{AppHandle, Emitter};
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::Connector;

use super::types::{LcuCredentials, LcuEvent};

/// Connect to LCU WebSocket and emit Tauri events on champ-select changes
pub async fn start_lcu_websocket(
    app: AppHandle,
    creds: LcuCredentials,
) -> Result<(), String> {
    let auth = BASE64.encode(format!("riot:{}", creds.password));
    let url = format!("wss://127.0.0.1:{}", creds.port);

    // Build TLS connector that accepts self-signed certs
    let tls = TlsConnector::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .map_err(|e| format!("TLS error: {}", e))?;

    let request = tokio_tungstenite::tungstenite::http::Request::builder()
        .uri(&url)
        .header("Authorization", format!("Basic {}", auth))
        .header("Host", format!("127.0.0.1:{}", creds.port))
        .header("Connection", "Upgrade")
        .header("Upgrade", "websocket")
        .header("Sec-WebSocket-Version", "13")
        .header("Sec-WebSocket-Key", tokio_tungstenite::tungstenite::handshake::client::generate_key())
        .body(())
        .map_err(|e| format!("Request build error: {}", e))?;

    let (ws_stream, _) = tokio_tungstenite::connect_async_tls_with_config(
        request,
        None,
        false,
        Some(Connector::NativeTls(tls)),
    )
    .await
    .map_err(|e| format!("WebSocket connect failed: {}", e))?;

    let (mut write, mut read) = ws_stream.split();

    // WAMP subscribe to all JSON API events: [5, "OnJsonApiEvent"]
    let subscribe_msg = r#"[5, "OnJsonApiEvent"]"#;
    write
        .send(Message::Text(subscribe_msg.to_string()))
        .await
        .map_err(|e| format!("Subscribe failed: {}", e))?;

    log::info!("LCU WebSocket connected, listening for events...");

    // Emit connection event
    let _ = app.emit("lcu-connected", ());

    while let Some(msg) = read.next().await {
        match msg {
            Ok(Message::Text(text)) => {
                // WAMP event format: [8, "OnJsonApiEvent", { data }]
                if let Ok(arr) = serde_json::from_str::<Vec<serde_json::Value>>(&text) {
                    if arr.len() >= 3 && arr[0].as_u64() == Some(8) {
                        if let Some(payload) = arr.get(2) {
                            let uri = payload.get("uri")
                                .and_then(|v| v.as_str())
                                .unwrap_or("");

                            // Filter for champ-select events
                            if uri.contains("/lol-champ-select/") {
                                let event = LcuEvent {
                                    uri: uri.to_string(),
                                    event_type: payload.get("eventType")
                                        .and_then(|v| v.as_str())
                                        .unwrap_or("Update")
                                        .to_string(),
                                    data: payload.get("data")
                                        .cloned()
                                        .unwrap_or(serde_json::Value::Null),
                                };
                                let _ = app.emit("lcu-champ-select", &event);
                            }
                        }
                    }
                }
            }
            Ok(Message::Close(_)) => {
                log::info!("LCU WebSocket closed");
                break;
            }
            Err(e) => {
                log::error!("LCU WebSocket error: {}", e);
                break;
            }
            _ => {}
        }
    }

    let _ = app.emit("lcu-disconnected", ());
    Ok(())
}
