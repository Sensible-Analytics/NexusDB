use crate::AppState;
use nexus_db::embedded::transaction::{Edge, Node, ReadTransaction};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Serialize, Deserialize)]
pub struct DbInfo {
    pub name: String,
    pub path: String,
    pub is_open: bool,
    pub node_count: usize,
    pub edge_count: usize,
}

#[derive(Serialize, Deserialize)]
pub struct DbStats {
    pub node_count: usize,
    pub edge_count: usize,
}

#[tauri::command]
pub fn db_create(
    state: tauri::State<AppState>,
    name: String,
    path: String,
) -> Result<String, String> {
    let db = nexus_db::embedded::database::Database::open(&path).map_err(|e| e.to_string())?;
    let mut dbs = state.databases.lock().map_err(|e| e.to_string())?;
    dbs.insert(name.clone(), Arc::new(db));
    Ok(format!("Database '{}' created at {}", name, path))
}

#[tauri::command]
pub fn db_open(
    state: tauri::State<AppState>,
    name: String,
    path: String,
) -> Result<String, String> {
    let db = nexus_db::embedded::database::Database::open(&path).map_err(|e| e.to_string())?;
    let mut dbs = state.databases.lock().map_err(|e| e.to_string())?;
    dbs.insert(name.clone(), Arc::new(db));
    Ok(format!("Database '{}' opened", name))
}

#[tauri::command]
pub fn db_close(state: tauri::State<AppState>, name: String) -> Result<String, String> {
    let mut dbs = state.databases.lock().map_err(|e| e.to_string())?;
    if dbs.remove(&name).is_some() {
        Ok(format!("Database '{}' closed", name))
    } else {
        Err(format!("Database '{}' not found", name))
    }
}

#[tauri::command]
pub fn db_list(state: tauri::State<AppState>) -> Result<Vec<String>, String> {
    let dbs = state.databases.lock().map_err(|e| e.to_string())?;
    Ok(dbs.keys().cloned().collect())
}

#[tauri::command]
pub fn db_stats(state: tauri::State<AppState>, name: String) -> Result<DbStats, String> {
    let dbs = state.databases.lock().map_err(|e| e.to_string())?;
    let db = dbs
        .get(&name)
        .ok_or_else(|| format!("Database '{}' not found", name))?;
    let tx = db.read_transaction().map_err(|e| e.to_string())?;
    let nodes = tx.scan_nodes().map_err(|e| e.to_string())?;
    let edges = tx.scan_edges().map_err(|e| e.to_string())?;
    Ok(DbStats {
        node_count: nodes.len(),
        edge_count: edges.len(),
    })
}

pub fn db_create_demo_internal(state: &AppState) -> Result<(), String> {
    use nexus_db::embedded::database::Database;

    let demo_path = dirs::home_dir()
        .ok_or("Could not determine home directory")?
        .join(".nexus")
        .join("demo");

    if demo_path.exists() {
        let dbs = state.databases.lock().map_err(|e| e.to_string())?;
        if dbs.contains_key("demo") {
            return Ok(());
        }
        drop(dbs);

        let db = Database::open(&demo_path).map_err(|e| e.to_string())?;
        let mut dbs = state.databases.lock().map_err(|e| e.to_string())?;
        dbs.insert("demo".to_string(), Arc::new(db));
        return Ok(());
    }

    let db = Database::open(&demo_path).map_err(|e| e.to_string())?;
    populate_demo_data(&db)?;

    let mut dbs = state.databases.lock().map_err(|e| e.to_string())?;
    dbs.insert("demo".to_string(), Arc::new(db));

    Ok(())
}

#[tauri::command]
pub fn db_create_demo(state: tauri::State<AppState>) -> Result<String, String> {
    db_create_demo_internal(&state).map(|_| "Demo database ready".to_string())
}

fn populate_demo_data(db: &nexus_db::embedded::database::Database) -> Result<(), String> {
    db.put_node(Node {
        id: 1,
        label: "Person:Alex".to_string(),
    })
    .map_err(|e| e.to_string())?;
    db.put_node(Node {
        id: 2,
        label: "Person:Manager".to_string(),
    })
    .map_err(|e| e.to_string())?;
    db.put_node(Node {
        id: 10,
        label: "Place:Office".to_string(),
    })
    .map_err(|e| e.to_string())?;
    db.put_node(Node {
        id: 11,
        label: "Place:Home".to_string(),
    })
    .map_err(|e| e.to_string())?;
    db.put_node(Node {
        id: 20,
        label: "Event:StressfulMeeting".to_string(),
    })
    .map_err(|e| e.to_string())?;
    db.put_node(Node {
        id: 21,
        label: "Event:PoorSleep".to_string(),
    })
    .map_err(|e| e.to_string())?;
    db.put_node(Node {
        id: 22,
        label: "Event:Travel".to_string(),
    })
    .map_err(|e| e.to_string())?;
    db.put_node(Node {
        id: 30,
        label: "Symptom:Fatigue".to_string(),
    })
    .map_err(|e| e.to_string())?;
    db.put_node(Node {
        id: 31,
        label: "Symptom:ExtremeTiredness".to_string(),
    })
    .map_err(|e| e.to_string())?;
    db.put_node(Node {
        id: 32,
        label: "Symptom:Headache".to_string(),
    })
    .map_err(|e| e.to_string())?;
    db.put_node(Node {
        id: 40,
        label: "Medication:Caffeine".to_string(),
    })
    .map_err(|e| e.to_string())?;

    db.put_edge(Edge {
        id: 100,
        label: "WORKS_AT".to_string(),
        from: 1,
        to: 10,
    })
    .map_err(|e| e.to_string())?;
    db.put_edge(Edge {
        id: 101,
        label: "LIVES_AT".to_string(),
        from: 1,
        to: 11,
    })
    .map_err(|e| e.to_string())?;
    db.put_edge(Edge {
        id: 102,
        label: "WORKS_AT".to_string(),
        from: 2,
        to: 10,
    })
    .map_err(|e| e.to_string())?;
    db.put_edge(Edge {
        id: 110,
        label: "HAPPENED_AT".to_string(),
        from: 20,
        to: 10,
    })
    .map_err(|e| e.to_string())?;
    db.put_edge(Edge {
        id: 111,
        label: "HAPPENED_AT".to_string(),
        from: 21,
        to: 11,
    })
    .map_err(|e| e.to_string())?;
    db.put_edge(Edge {
        id: 112,
        label: "HAPPENED_AT".to_string(),
        from: 22,
        to: 10,
    })
    .map_err(|e| e.to_string())?;
    db.put_edge(Edge {
        id: 120,
        label: "EXPERIENCED".to_string(),
        from: 1,
        to: 20,
    })
    .map_err(|e| e.to_string())?;
    db.put_edge(Edge {
        id: 121,
        label: "EXPERIENCED".to_string(),
        from: 1,
        to: 21,
    })
    .map_err(|e| e.to_string())?;
    db.put_edge(Edge {
        id: 122,
        label: "EXPERIENCED".to_string(),
        from: 1,
        to: 22,
    })
    .map_err(|e| e.to_string())?;
    db.put_edge(Edge {
        id: 130,
        label: "TRIGGERED".to_string(),
        from: 21,
        to: 30,
    })
    .map_err(|e| e.to_string())?;
    db.put_edge(Edge {
        id: 131,
        label: "TRIGGERED".to_string(),
        from: 20,
        to: 30,
    })
    .map_err(|e| e.to_string())?;
    db.put_edge(Edge {
        id: 132,
        label: "TRIGGERED".to_string(),
        from: 22,
        to: 31,
    })
    .map_err(|e| e.to_string())?;
    db.put_edge(Edge {
        id: 133,
        label: "TRIGGERED".to_string(),
        from: 20,
        to: 32,
    })
    .map_err(|e| e.to_string())?;
    db.put_edge(Edge {
        id: 140,
        label: "MANAGED_WITH".to_string(),
        from: 30,
        to: 40,
    })
    .map_err(|e| e.to_string())?;
    db.put_edge(Edge {
        id: 150,
        label: "HAS_SYMPTOM".to_string(),
        from: 1,
        to: 30,
    })
    .map_err(|e| e.to_string())?;
    db.put_edge(Edge {
        id: 151,
        label: "HAS_SYMPTOM".to_string(),
        from: 1,
        to: 31,
    })
    .map_err(|e| e.to_string())?;

    Ok(())
}
