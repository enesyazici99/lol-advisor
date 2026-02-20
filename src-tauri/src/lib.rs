mod lcu;

use std::sync::Mutex;
use tauri::{
    AppHandle, Manager, RunEvent,
    menu::{MenuBuilder, MenuItemBuilder},
    tray::TrayIconBuilder,
};

use lcu::client;
use lcu::detector;
use lcu::types::{ChampSelectSession, CurrentSummoner, LcuCredentials};
use lcu::websocket;

/// Managed state holding LCU credentials
struct LcuState {
    credentials: Mutex<Option<LcuCredentials>>,
}

/// Detect the LoL client and return credentials
#[tauri::command]
async fn detect_client(state: tauri::State<'_, LcuState>) -> Result<bool, String> {
    match detector::detect_lcu() {
        Some(creds) => {
            let mut lock = state.credentials.lock().map_err(|e| e.to_string())?;
            *lock = Some(creds);
            Ok(true)
        }
        None => {
            let mut lock = state.credentials.lock().map_err(|e| e.to_string())?;
            *lock = None;
            Ok(false)
        }
    }
}

/// Get champion select session from LCU
#[tauri::command]
async fn get_champ_select(
    state: tauri::State<'_, LcuState>,
) -> Result<ChampSelectSession, String> {
    let creds = {
        let lock = state.credentials.lock().map_err(|e| e.to_string())?;
        lock.clone().ok_or("LCU not connected")?
    };
    client::fetch_champion_select(&creds).await
}

/// Get current summoner from LCU
#[tauri::command]
async fn get_current_summoner(
    state: tauri::State<'_, LcuState>,
) -> Result<CurrentSummoner, String> {
    let creds = {
        let lock = state.credentials.lock().map_err(|e| e.to_string())?;
        lock.clone().ok_or("LCU not connected")?
    };
    client::fetch_current_summoner(&creds).await
}

/// Start LCU WebSocket watcher that emits events to frontend
#[tauri::command]
async fn start_lcu_watcher(
    app: AppHandle,
    state: tauri::State<'_, LcuState>,
) -> Result<(), String> {
    let creds = {
        let lock = state.credentials.lock().map_err(|e| e.to_string())?;
        lock.clone().ok_or("LCU not connected")?
    };

    // Spawn WebSocket listener in background
    tauri::async_runtime::spawn(async move {
        if let Err(e) = websocket::start_lcu_websocket(app, creds).await {
            log::error!("LCU WebSocket error: {}", e);
        }
    });

    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(LcuState {
            credentials: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            detect_client,
            get_champ_select,
            get_current_summoner,
            start_lcu_watcher,
        ])
        .setup(|app| {
            // Build system tray menu
            let show = MenuItemBuilder::with_id("show", "Show Window").build(app)?;
            let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
            let menu = MenuBuilder::new(app).items(&[&show, &quit]).build()?;

            // Build tray icon
            TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("LOL Advisor")
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            // Hide to tray on close instead of quitting
            if let RunEvent::WindowEvent {
                label,
                event: tauri::WindowEvent::CloseRequested { api, .. },
                ..
            } = &event
            {
                if label == "main" {
                    api.prevent_close();
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.hide();
                    }
                }
            }
        });
}
