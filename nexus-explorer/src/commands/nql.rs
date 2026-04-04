use crate::AppState;
use nexus_db::embedded::transaction::{Edge, Node, ReadTransaction};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct NqlRequest {
    pub db_name: String,
    pub query: String,
}

#[derive(Serialize, Deserialize)]
pub struct NqlResult {
    pub success: bool,
    pub message: String,
    pub data: Option<serde_json::Value>,
}

#[derive(Serialize, Clone)]
struct QNode {
    id: u128,
    label: String,
}

#[derive(Serialize, Clone)]
struct QEdge {
    id: u128,
    label: String,
    from: u128,
    to: u128,
}

#[derive(Serialize)]
struct QResult {
    nodes: Vec<QNode>,
    edges: Vec<QEdge>,
    count: usize,
}

#[tauri::command]
pub fn nql_execute(
    state: tauri::State<AppState>,
    db_name: String,
    query: String,
) -> Result<NqlResult, String> {
    let dbs = state.databases.lock().map_err(|e| e.to_string())?;
    let db = dbs
        .get(&db_name)
        .ok_or_else(|| format!("Database '{}' not found", db_name))?;

    let tx = db.read_transaction().map_err(|e| e.to_string())?;
    let all_nodes = tx.scan_nodes().map_err(|e| e.to_string())?;
    let all_edges = tx.scan_edges().map_err(|e| e.to_string())?;

    let q = query.trim().to_lowercase();

    let result = if q.starts_with("match") || q.starts_with("search") {
        do_match(&q, &all_nodes, &all_edges)?
    } else if q.starts_with("get") || q.starts_with("find") {
        do_get(&q, &all_nodes, &all_edges)?
    } else if q.starts_with("count") {
        do_count(&q, &all_nodes, &all_edges)?
    } else {
        QResult {
            nodes: all_nodes.iter().map(|n| QNode { id: n.id, label: n.label.clone() }).collect(),
            edges: all_edges.iter().map(|e| QEdge { id: e.id, label: e.label.clone(), from: e.from, to: e.to }).collect(),
            count: all_nodes.len(),
        }
    };

    Ok(NqlResult {
        success: true,
        message: format!("Query returned {} nodes and {} edges", result.nodes.len(), result.edges.len()),
        data: Some(serde_json::to_value(&result).map_err(|e| e.to_string())?),
    })
}

fn do_match(q: &str, nodes: &[Node], edges: &[Edge]) -> Result<QResult, String> {
    let label = pick_label(q);
    let matched: Vec<QNode> = nodes.iter()
        .filter(|n| label.as_ref().map_or(true, |l| n.label.contains(l)))
        .map(|n| QNode { id: n.id, label: n.label.clone() })
        .collect();
    let matched_edges: Vec<QEdge> = if q.contains(")-[") || q.contains("]->") {
        let el = pick_edge_label(q);
        edges.iter()
            .filter(|e| {
                let nm = matched.iter().any(|n| n.id == e.from || n.id == e.to);
                el.as_ref().map_or(nm, |x| e.label.contains(x) && nm)
            })
            .map(|e| QEdge { id: e.id, label: e.label.clone(), from: e.from, to: e.to })
            .collect()
    } else { vec![] };
    Ok(QResult { nodes: matched.clone(), edges: matched_edges, count: matched.len() })
}

fn do_get(q: &str, nodes: &[Node], edges: &[Edge]) -> Result<QResult, String> {
    let term = pick_search(q);
    let matched: Vec<QNode> = nodes.iter()
        .filter(|n| term.as_ref().map_or(true, |s| n.label.to_lowercase().contains(s)))
        .map(|n| QNode { id: n.id, label: n.label.clone() })
        .collect();
    let matched_edges: Vec<QEdge> = edges.iter()
        .filter(|e| matched.iter().any(|n| n.id == e.from || n.id == e.to))
        .map(|e| QEdge { id: e.id, label: e.label.clone(), from: e.from, to: e.to })
        .collect();
    Ok(QResult { nodes: matched.clone(), edges: matched_edges, count: matched.len() })
}

fn do_count(q: &str, nodes: &[Node], edges: &[Edge]) -> Result<QResult, String> {
    let label = pick_label(q);
    let count = if q.contains("edge") || q.contains("relationship") {
        edges.len()
    } else {
        nodes.iter().filter(|n| label.as_ref().map_or(true, |l| n.label.contains(l))).count()
    };
    Ok(QResult { nodes: vec![], edges: vec![], count })
}

fn pick_label(q: &str) -> Option<String> {
    let pos = q.find(':')?;
    let rest = &q[pos + 1..];
    let end = rest.find(|c: char| !c.is_alphanumeric() && c != '_').unwrap_or(rest.len());
    if end > 0 { Some(rest[..end].to_string()) } else { None }
}

fn pick_edge_label(q: &str) -> Option<String> {
    let start = q.find(")-[")?;
    let rest = &q[start + 3..];
    let colon = rest.find(':')?;
    let after = &rest[colon + 1..];
    let end = after.find(']')?;
    if end > 0 { Some(after[..end].to_string()) } else { None }
}

fn pick_search(q: &str) -> Option<String> {
    for pat in &["contains \"", "contains '", "= \"", "= '"] {
        if let Some(s) = q.find(pat) {
            let rest = &q[s + pat.len()..];
            let delim = if pat.contains('"') { '"' } else { '\'' };
            if let Some(e) = rest.find(delim) {
                return Some(rest[..e].to_lowercase());
            }
        }
    }
    None
}
