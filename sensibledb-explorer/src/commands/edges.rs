use crate::AppState;
use sensibledb_db::embedded::transaction::{Edge, ReadTransaction};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct EdgeDto {
    pub id: u128,
    pub label: String,
    pub from: u128,
    pub to: u128,
}

#[derive(Deserialize)]
pub struct CreateEdgeRequest {
    pub db_name: String,
    pub id: u128,
    pub label: String,
    pub from_node: u128,
    pub to_node: u128,
}

#[tauri::command]
pub fn edge_create(
    state: tauri::State<AppState>,
    req: CreateEdgeRequest,
) -> Result<EdgeDto, String> {
    let dbs = state.databases.lock().map_err(|e| e.to_string())?;
    let db = dbs
        .get(&req.db_name)
        .ok_or_else(|| format!("Database '{}' not found", req.db_name))?;
    let edge = Edge {
        id: req.id,
        label: req.label,
        from: req.from_node,
        to: req.to_node,
    };
    db.put_edge(edge.clone()).map_err(|e| e.to_string())?;
    Ok(EdgeDto {
        id: edge.id,
        label: edge.label,
        from: edge.from,
        to: edge.to,
    })
}

#[tauri::command]
pub fn edge_get(
    state: tauri::State<AppState>,
    db_name: String,
    id: u128,
) -> Result<Option<EdgeDto>, String> {
    let dbs = state.databases.lock().map_err(|e| e.to_string())?;
    let db = dbs
        .get(&db_name)
        .ok_or_else(|| format!("Database '{}' not found", db_name))?;
    let edge = db.get_edge(id).map_err(|e| e.to_string())?;
    Ok(edge.map(|e| EdgeDto {
        id: e.id,
        label: e.label,
        from: e.from,
        to: e.to,
    }))
}

#[tauri::command]
pub fn edge_update(
    state: tauri::State<AppState>,
    db_name: String,
    id: u128,
    label: String,
    from_node: u128,
    to_node: u128,
) -> Result<EdgeDto, String> {
    let dbs = state.databases.lock().map_err(|e| e.to_string())?;
    let db = dbs
        .get(&db_name)
        .ok_or_else(|| format!("Database '{}' not found", db_name))?;
    let edge = Edge {
        id,
        label,
        from: from_node,
        to: to_node,
    };
    db.put_edge(edge.clone()).map_err(|e| e.to_string())?;
    Ok(EdgeDto {
        id: edge.id,
        label: edge.label,
        from: edge.from,
        to: edge.to,
    })
}

#[tauri::command]
pub fn edge_delete(
    state: tauri::State<AppState>,
    db_name: String,
    id: u128,
) -> Result<String, String> {
    let dbs = state.databases.lock().map_err(|e| e.to_string())?;
    let db = dbs
        .get(&db_name)
        .ok_or_else(|| format!("Database '{}' not found", db_name))?;
    db.delete_edge(id).map_err(|e| e.to_string())?;
    Ok("Edge deleted".to_string())
}

#[tauri::command]
pub fn edge_list(state: tauri::State<AppState>, db_name: String) -> Result<Vec<EdgeDto>, String> {
    let dbs = state.databases.lock().map_err(|e| e.to_string())?;
    let db = dbs
        .get(&db_name)
        .ok_or_else(|| format!("Database '{}' not found", db_name))?;
    let tx = db.read_transaction().map_err(|e| e.to_string())?;
    let edges = tx.scan_edges().map_err(|e| e.to_string())?;
    Ok(edges
        .into_iter()
        .map(|e| EdgeDto {
            id: e.id,
            label: e.label,
            from: e.from,
            to: e.to,
        })
        .collect())
}
