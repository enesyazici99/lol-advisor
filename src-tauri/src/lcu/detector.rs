use std::fs;
use std::process::Command;
use regex::Regex;
use super::types::LcuCredentials;

/// Known lockfile locations on Windows
const LOCKFILE_PATHS: &[&str] = &[
    "C:/Riot Games/League of Legends/lockfile",
    "D:/Riot Games/League of Legends/lockfile",
    "C:/Program Files/Riot Games/League of Legends/lockfile",
    "C:/Program Files (x86)/Riot Games/League of Legends/lockfile",
];

/// Parse a lockfile line: LeagueClient:pid:port:password:protocol
fn parse_lockfile(contents: &str) -> Option<LcuCredentials> {
    let parts: Vec<&str> = contents.trim().split(':').collect();
    if parts.len() < 5 {
        return None;
    }
    let pid = parts[1].parse::<u32>().ok()?;
    let port = parts[2].parse::<u16>().ok()?;
    let password = parts[3].to_string();
    Some(LcuCredentials { port, password, pid })
}

/// Try reading lockfile from known paths
fn detect_from_lockfile() -> Option<LcuCredentials> {
    for path in LOCKFILE_PATHS {
        if let Ok(contents) = fs::read_to_string(path) {
            if let Some(creds) = parse_lockfile(&contents) {
                return Some(creds);
            }
        }
    }
    None
}

/// Fallback: find League process via wmic and extract port + token from command line
fn detect_from_wmic() -> Option<LcuCredentials> {
    let output = Command::new("wmic")
        .args(["process", "where", "name='LeagueClientUx.exe'", "get", "CommandLine,ProcessId", "/FORMAT:LIST"])
        .output()
        .ok()?;

    let stdout = String::from_utf8_lossy(&output.stdout);

    let port_re = Regex::new(r"--app-port=(\d+)").ok()?;
    let token_re = Regex::new(r"--remoting-auth-token=([\w_-]+)").ok()?;
    let pid_re = Regex::new(r"ProcessId=(\d+)").ok()?;

    let port = port_re.captures(&stdout)?.get(1)?.as_str().parse::<u16>().ok()?;
    let password = token_re.captures(&stdout)?.get(1)?.as_str().to_string();
    let pid = pid_re.captures(&stdout)?.get(1)?.as_str().parse::<u32>().ok()?;

    Some(LcuCredentials { port, password, pid })
}

/// Detect LCU credentials: lockfile first, wmic fallback
pub fn detect_lcu() -> Option<LcuCredentials> {
    detect_from_lockfile().or_else(detect_from_wmic)
}
