use crate::AppState;
use sensibledb_db::embedded::transaction::{Node, ReadTransaction};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct NodeDto {
    pub id: u128,
    pub label: String,
}

#[derive(Deserialize)]
pub struct CreateNodeRequest {
    pub db_name: String,
    pub id: u128,
    pub label: String,
}

#[tauri::command]
pub fn node_create(
    state: tauri::State<AppState>,
    req: CreateNodeRequest,
) -> Result<NodeDto, String> {
    let dbs = state.databases.lock().map_err(|e| e.to_string())?;
    let db = dbs
        .get(&req.db_name)
        .ok_or_else(|| format!("Database '{}' not found", req.db_name))?;
    let node = Node {
        id: req.id,
        label: req.label,
    };
    db.put_node(node.clone()).map_err(|e| e.to_string())?;
    Ok(NodeDto {
        id: node.id,
        label: node.label,
    })
}

#[tauri::command]
pub fn node_get(
    state: tauri::State<AppState>,
    db_name: String,
    id: u128,
) -> Result<Option<NodeDto>, String> {
    let dbs = state.databases.lock().map_err(|e| e.to_string())?;
    let db = dbs
        .get(&db_name)
        .ok_or_else(|| format!("Database '{}' not found", db_name))?;
    let node = db.get_node(id).map_err(|e| e.to_string())?;
    Ok(node.map(|n| NodeDto {
        id: n.id,
        label: n.label,
    }))
}

#[tauri::command]
pub fn node_update(
    state: tauri::State<AppState>,
    db_name: String,
    id: u128,
    label: String,
) -> Result<NodeDto, String> {
    let dbs = state.databases.lock().map_err(|e| e.to_string())?;
    let db = dbs
        .get(&db_name)
        .ok_or_else(|| format!("Database '{}' not found", db_name))?;
    let node = Node { id, label };
    db.put_node(node.clone()).map_err(|e| e.to_string())?;
    Ok(NodeDto {
        id: node.id,
        label: node.label,
    })
}

#[tauri::command]
pub fn node_delete(
    state: tauri::State<AppState>,
    db_name: String,
    id: u128,
) -> Result<String, String> {
    let dbs = state.databases.lock().map_err(|e| e.to_string())?;
    let db = dbs
        .get(&db_name)
        .ok_or_else(|| format!("Database '{}' not found", db_name))?;
    db.delete_node(id).map_err(|e| e.to_string())?;
    Ok("Node deleted".to_string())
}

#[tauri::command]
pub fn node_list(state: tauri::State<AppState>, db_name: String) -> Result<Vec<NodeDto>, String> {
    let log_msg = format!("[NODE_LIST] Called with db_name={}
", db_name);
    eprint!("{}", log_msg);
    let _ = std::fs::write("/tmp/sensibledb-explorer.log", format!("{}
{}", 
        std::fs::read_to_string("/tmp/sensibledb-explorer.log").unwrap_or_default(), log_msg));
    let dbs = state.databases.lock().map_err(|e| e.to_string())?;
    eprintln!("[NODE_LIST] Available DBs: {:?}", dbs.keys().collect::<Vec<_>>());
    let db = dbs
        .get(&db_name)
        .ok_or_else(|| format!("Database '{}' not found. Available: {:?}", db_name, dbs.keys().collect::<Vec<_>>()))?;
    let tx = db.read_transaction().map_err(|e| e.to_string())?;
    let nodes = tx.scan_nodes().map_err(|e| e.to_string())?;
    let log_msg2 = format!("[NODE_LIST] db={} found {} nodes
", db_name, nodes.len());
    eprint!("{}", log_msg2);
    let _ = std::fs::write("/tmp/sensibledb-explorer.log", format!("{}
{}", 
        std::fs::read_to_string("/tmp/sensibledb-explorer.log").unwrap_or_default(), log_msg2));
    Ok(nodes
        .into_iter()
        .map(|n| NodeDto {
            id: n.id,
            label: n.label,
        })
        .collect())
}
