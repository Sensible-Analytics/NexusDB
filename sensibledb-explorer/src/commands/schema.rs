use crate::AppState;
use sensibledb_db::embedded::transaction::ReadTransaction;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

#[derive(Serialize, Deserialize)]
pub struct SchemaInfo {
    pub node_labels: Vec<String>,
    pub edge_labels: Vec<String>,
    pub node_counts: HashMap<String, usize>,
    pub edge_counts: HashMap<String, usize>,
    pub total_nodes: usize,
    pub total_edges: usize,
}

#[tauri::command]
pub fn schema_get(state: tauri::State<AppState>, db_name: String) -> Result<SchemaInfo, String> {
    let dbs = state.databases.lock().map_err(|e| e.to_string())?;
    let db = dbs
        .get(&db_name)
        .ok_or_else(|| format!("Database '{}' not found", db_name))?;
    let tx = db.read_transaction().map_err(|e| e.to_string())?;
    let nodes = tx.scan_nodes().map_err(|e| e.to_string())?;
    let edges = tx.scan_edges().map_err(|e| e.to_string())?;

    let mut node_label_set = HashSet::new();
    let mut node_counts = HashMap::new();
    for n in &nodes {
        node_label_set.insert(n.label.clone());
        *node_counts.entry(n.label.clone()).or_insert(0) += 1;
    }

    let mut edge_label_set = HashSet::new();
    let mut edge_counts = HashMap::new();
    for e in &edges {
        edge_label_set.insert(e.label.clone());
        *edge_counts.entry(e.label.clone()).or_insert(0) += 1;
    }

    Ok(SchemaInfo {
        node_labels: node_label_set.into_iter().collect(),
        edge_labels: edge_label_set.into_iter().collect(),
        node_counts,
        edge_counts,
        total_nodes: nodes.len(),
        total_edges: edges.len(),
    })
}
