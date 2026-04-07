#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod ollama;

use sensibledb_db::embedded::database::Database;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

pub struct AppState {
    pub databases: Mutex<HashMap<String, Arc<Database>>>,
}

fn main() {
    let app_state = AppState {
        databases: Mutex::new(HashMap::new()),
    };

    let demo_result = commands::db_create_demo_internal(&app_state);
    if let Err(e) = demo_result {
        eprintln!("Warning: Could not create demo database: {}", e);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            commands::db_create,
            commands::db_open,
            commands::db_close,
            commands::db_list,
            commands::db_stats,
            commands::db_create_demo,
            commands::log_error,
            commands::node_create,
            commands::node_get,
            commands::node_update,
            commands::node_delete,
            commands::node_list,
            commands::edge_create,
            commands::edge_get,
            commands::edge_update,
            commands::edge_delete,
            commands::edge_list,
            commands::schema_get,
            commands::sensibleql_execute,
            commands::ollama_check_status,
            commands::ollama_pull_model,
            commands::generate_embeddings,
            commands::translate_nl_to_sensibleql,
            commands::ingest_document,
            commands::chunk_text,
            commands::extract_entities_from_chunks,
        ])
        .run(tauri::generate_context!())
        .expect("error while running SensibleDB Explorer");
}
