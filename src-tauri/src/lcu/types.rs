use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LcuCredentials {
    pub port: u16,
    pub password: String,
    pub pid: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChampSelectSession {
    pub my_team: Vec<ChampSelectPlayer>,
    pub their_team: Vec<ChampSelectPlayer>,
    pub actions: Vec<Vec<ChampSelectAction>>,
    pub bans: ChampSelectBans,
    pub timer: ChampSelectTimer,
    pub local_player_cell_id: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChampSelectPlayer {
    pub cell_id: i64,
    pub champion_id: i64,
    pub summoner_id: Option<i64>,
    pub assigned_position: String,
    pub spell1_id: Option<i64>,
    pub spell2_id: Option<i64>,
    #[serde(default)]
    pub player_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChampSelectAction {
    pub id: i64,
    pub actor_cell_id: i64,
    pub champion_id: i64,
    pub completed: bool,
    #[serde(rename = "type")]
    pub action_type: String,
    #[serde(default)]
    pub is_ally_action: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChampSelectBans {
    pub my_team_bans: Vec<i64>,
    pub their_team_bans: Vec<i64>,
    #[serde(default)]
    pub num_bans: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChampSelectTimer {
    pub phase: String,
    #[serde(default)]
    pub adjusted_time_left_in_phase: i64,
    #[serde(default)]
    pub total_time_in_phase: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CurrentSummoner {
    pub display_name: String,
    pub summoner_id: i64,
    pub puuid: String,
    pub account_id: i64,
    pub profile_icon_id: i64,
    pub summoner_level: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LcuEvent {
    pub uri: String,
    pub event_type: String,
    pub data: serde_json::Value,
}
