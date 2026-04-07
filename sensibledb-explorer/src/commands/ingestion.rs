use crate::ollama::client::{OllamaClient, ChatMessage};
use crate::AppState;
use sensibledb_db::embedded::error::Error as DbError;
use sensibledb_db::embedded::transaction::WriteTransaction;
use serde::{Deserialize, Serialize};
use std::sync::PoisonError;

#[derive(Serialize, Deserialize)]
pub struct IngestionResult {
    pub chunk_count: usize,
    pub entity_count: usize,
    pub document_id: String,
}

#[derive(Serialize, Deserialize)]
pub struct DocumentChunk {
    pub id: String,
    pub content: String,
    pub metadata: serde_json::Value,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ExtractedEntity {
    pub subject: String,
    pub predicate: String,
    pub object: String,
}

#[tauri::command]
pub async fn ingest_document(
    state: tauri::State<'_, AppState>,
    file_path: String,
    db_name: String,
    ollama_url: Option<String>,
    embedding_model: Option<String>,
) -> Result<IngestionResult, String> {
    let content = std::fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let extension = std::path::Path::new(&file_path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("txt");

    let file_type = match extension {
        "md" | "markdown" => "markdown",
        "csv" => "csv",
        "json" => "json",
        _ => "txt",
    };

    let chunks = chunk_text(content, file_type.to_string())?;
    let chunk_count = chunks.len();

    let chunk_texts: Vec<String> = chunks.iter().map(|c| c.content.clone()).collect();

    let entities = extract_entities_from_chunks(
        chunk_texts,
        embedding_model,
        ollama_url,
    ).await?;

    let entity_count = entities.len();
    let document_id = uuid_simple();

    let dbs = state.databases.lock().map_err(|e: PoisonError<_>| e.to_string())?;

    if let Some(db) = dbs.get(&db_name) {
        let mut tx = (**db).write_transaction().map_err(|e: DbError| e.to_string())?;

        let doc_node_id: u128 = 1;
        tx.put_node(sensibledb_db::embedded::transaction::Node {
            id: doc_node_id,
            label: format!("Document:{}", document_id),
        }).map_err(|e: DbError| e.to_string())?;

        for (i, chunk) in chunks.iter().enumerate() {
            let chunk_id: u128 = (i as u128) + 10;
            tx.put_node(sensibledb_db::embedded::transaction::Node {
                id: chunk_id,
                label: format!("Chunk:{}", chunk.id),
            }).map_err(|e: DbError| e.to_string())?;

            tx.put_edge(sensibledb_db::embedded::transaction::Edge {
                id: (i as u128) + 100,
                label: "HAS_CHUNK".to_string(),
                from: doc_node_id,
                to: chunk_id,
            }).map_err(|e: DbError| e.to_string())?;
        }

        for (i, entity) in entities.iter().enumerate() {
            let subject_id: u128 = (i as u128) * 3 + 1000;
            let object_id: u128 = (i as u128) * 3 + 1001;
            let edge_id: u128 = (i as u128) * 3 + 1002;

            tx.put_node(sensibledb_db::embedded::transaction::Node {
                id: subject_id,
                label: format!("Entity:{}", entity.subject),
            }).map_err(|e: DbError| e.to_string())?;

            tx.put_node(sensibledb_db::embedded::transaction::Node {
                id: object_id,
                label: format!("Entity:{}", entity.object),
            }).map_err(|e: DbError| e.to_string())?;

            tx.put_edge(sensibledb_db::embedded::transaction::Edge {
                id: edge_id,
                label: entity.predicate.clone(),
                from: subject_id,
                to: object_id,
            }).map_err(|e: DbError| e.to_string())?;

            tx.put_edge(sensibledb_db::embedded::transaction::Edge {
                id: edge_id + 10000,
                label: "RELATES_TO".to_string(),
                from: doc_node_id,
                to: subject_id,
            }).map_err(|e: DbError| e.to_string())?;
        }

        tx.commit().map_err(|e: DbError| e.to_string())?;
    }

    Ok(IngestionResult {
        chunk_count,
        entity_count,
        document_id,
    })
}

fn uuid_simple() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    format!("doc_{:x}", now)
}

#[tauri::command]
pub fn chunk_text(content: String, file_type: String) -> Result<Vec<DocumentChunk>, String> {
    match file_type.as_str() {
        "csv" => chunk_csv(&content),
        "markdown" => chunk_markdown(&content),
        "json" => chunk_json(&content),
        "txt" => chunk_txt(&content),
        _ => chunk_txt(&content),
    }
}

fn chunk_csv(content: &str) -> Result<Vec<DocumentChunk>, String> {
    let mut chunks = Vec::new();
    let lines: Vec<&str> = content.lines().collect();

    if lines.is_empty() {
        return Ok(chunks);
    }

    let headers: Vec<&str> = lines[0].split(',').map(|s| s.trim()).collect();

    for (i, line) in lines.iter().skip(1).enumerate() {
        let values: Vec<&str> = line.split(',').map(|s| s.trim()).collect();
        let mut row_data = serde_json::Map::new();

        for (j, header) in headers.iter().enumerate() {
            let value = values.get(j).unwrap_or(&"");
            row_data.insert(header.to_string(), serde_json::Value::String(value.to_string()));
        }

        let chunk_id = format!("csv_chunk_{}", i + 1);
        let content_str = row_data
            .iter()
            .map(|(k, v)| format!("{}: {}", k, v))
            .collect::<Vec<_>>()
            .join(", ");

        chunks.push(DocumentChunk {
            id: chunk_id,
            content: content_str,
            metadata: serde_json::Value::Object(row_data),
        });
    }

    Ok(chunks)
}

fn chunk_markdown(content: &str) -> Result<Vec<DocumentChunk>, String> {
    let mut chunks = Vec::new();
    let mut current_chunk = String::new();
    let mut chunk_index = 0;

    for line in content.lines() {
        if line.starts_with("## ") {
            if !current_chunk.is_empty() {
                chunk_index += 1;
                chunks.push(DocumentChunk {
                    id: format!("md_chunk_{}", chunk_index),
                    content: current_chunk.trim().to_string(),
                    metadata: serde_json::json!({ "type": "markdown_section" }),
                });
            }
            current_chunk = line.to_string();
        } else {
            if !current_chunk.is_empty() || !line.is_empty() {
                current_chunk.push_str("\n");
                current_chunk.push_str(line);
            }
        }
    }

    if !current_chunk.is_empty() {
        chunk_index += 1;
        chunks.push(DocumentChunk {
            id: format!("md_chunk_{}", chunk_index),
            content: current_chunk.trim().to_string(),
            metadata: serde_json::json!({ "type": "markdown_section" }),
        });
    }

    if chunks.is_empty() {
        chunks.push(DocumentChunk {
            id: "md_chunk_1".to_string(),
            content: content.trim().to_string(),
            metadata: serde_json::json!({ "type": "markdown_section" }),
        });
    }

    Ok(chunks)
}

fn chunk_json(content: &str) -> Result<Vec<DocumentChunk>, String> {
    let mut chunks = Vec::new();

    if let Ok(arr) = serde_json::from_str::<serde_json::Value>(content) {
        if let serde_json::Value::Array(items) = arr {
            for (i, item) in items.iter().enumerate() {
                let chunk_id = format!("json_chunk_{}", i + 1);
                let content_str = item.to_string();
                let metadata = serde_json::json!({
                    "type": "json_object",
                    "index": i
                });

                chunks.push(DocumentChunk {
                    id: chunk_id,
                    content: content_str,
                    metadata,
                });
            }
            return Ok(chunks);
        }
    }

    chunks.push(DocumentChunk {
        id: "json_chunk_1".to_string(),
        content: content.to_string(),
        metadata: serde_json::json!({ "type": "json_object" }),
    });

    Ok(chunks)
}

fn chunk_txt(content: &str) -> Result<Vec<DocumentChunk>, String> {
    let mut chunks = Vec::new();
    let paragraphs: Vec<&str> = content.split("\n\n").collect();
    let mut chunk_index = 0;

    for para in paragraphs {
        let trimmed = para.trim();
        if !trimmed.is_empty() {
            chunk_index += 1;
            chunks.push(DocumentChunk {
                id: format!("txt_chunk_{}", chunk_index),
                content: trimmed.to_string(),
                metadata: serde_json::json!({ "type": "text_paragraph" }),
            });
        }
    }

    if chunks.is_empty() {
        chunks.push(DocumentChunk {
            id: "txt_chunk_1".to_string(),
            content: content.trim().to_string(),
            metadata: serde_json::json!({ "type": "text_paragraph" }),
        });
    }

    Ok(chunks)
}

#[tauri::command]
pub async fn extract_entities_from_chunks(
    chunks: Vec<String>,
    model: Option<String>,
    ollama_url: Option<String>,
) -> Result<Vec<ExtractedEntity>, String> {
    let model_name = model.unwrap_or_else(|| "qwen2.5-coder:3b".to_string());
    let client = OllamaClient::new(ollama_url);

    let system_prompt = "Extract entity relationships as triples. Format: subject|predicate|object. One per line. Be concise.".to_string();

    let mut all_entities = Vec::new();

    for chunk in chunks {
        let user_prompt = format!("Extract triples from:\n{}", chunk);

        let messages = vec![
            ChatMessage {
                role: "system".to_string(),
                content: system_prompt.clone(),
            },
            ChatMessage {
                role: "user".to_string(),
                content: user_prompt,
            },
        ];

        match client.chat_completion(&model_name, messages).await {
            Ok(response_text) => {
                for line in response_text.lines() {
                    let trimmed = line.trim();
                    if !trimmed.is_empty() {
                        let parts: Vec<&str> = trimmed.split('|').collect();
                        if parts.len() == 3 {
                            all_entities.push(ExtractedEntity {
                                subject: parts[0].trim().to_string(),
                                predicate: parts[1].trim().to_string(),
                                object: parts[2].trim().to_string(),
                            });
                        }
                    }
                }
            }
            Err(e) => {
                eprintln!("Failed to extract entities from chunk: {}", e);
            }
        }
    }

    Ok(all_entities)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chunk_text_csv_multiple_rows() {
        let content = "name,age,city\nAlice,30,NYC\nBob,25,LA\nCharlie,35,Chicago";
        let result = chunk_text(content.to_string(), "csv".to_string()).unwrap();
        assert_eq!(result.len(), 3);
        assert!(result[0].content.contains("Alice"));
        assert!(result[0].content.contains("30"));
        assert!(result[1].content.contains("Bob"));
    }

    #[test]
    fn test_chunk_text_markdown_with_headings() {
        let content = "## Introduction\nThis is the intro text.\n\n## Features\nHere are the features.\n\n## Conclusion\nThat's all.";
        let result = chunk_text(content.to_string(), "markdown".to_string()).unwrap();
        assert!(result.len() >= 3);
        assert!(result[0].content.contains("## Introduction"));
    }

    #[test]
    fn test_chunk_text_json_array() {
        let content = r#"[{"id":1,"name":"item1"},{"id":2,"name":"item2"},{"id":3,"name":"item3"}]"#;
        let result = chunk_text(content.to_string(), "json".to_string()).unwrap();
        assert_eq!(result.len(), 3);
        assert!(result[0].content.contains("item1"));
    }

    #[test]
    fn test_chunk_text_json_object() {
        let content = r#"{"name":"test","value":42,"items":["a","b","c"]}"#;
        let result = chunk_text(content.to_string(), "json".to_string()).unwrap();
        assert_eq!(result.len(), 1);
        assert!(result[0].content.contains("test"));
    }

    #[test]
    fn test_chunk_text_txt_paragraphs() {
        let content = "First paragraph here.\n\nSecond paragraph here.\n\nThird paragraph here.";
        let result = chunk_text(content.to_string(), "txt".to_string()).unwrap();
        assert!(result.len() >= 3);
        assert!(result[0].content.contains("First"));
    }

    #[test]
    fn test_chunk_text_empty_content() {
        let result = chunk_text("".to_string(), "txt".to_string()).unwrap();
        assert!(result.len() >= 1);
    }

    #[test]
    fn test_chunk_text_unknown_file_type() {
        let content = "Some content with\n\nparagraphs.";
        let result = chunk_text(content.to_string(), "bin".to_string()).unwrap();
        assert!(result.len() >= 1);
    }

    #[test]
    fn test_chunk_csv_with_empty_lines() {
        let content = "name,value\nitem1,100\n\nitem2,200\n\nitem3,300";
        let result = chunk_csv(content).unwrap();
        assert_eq!(result.len(), 5);
    }

    #[test]
    fn test_chunk_markdown_no_headings() {
        let content = "This is just plain text without any headings.";
        let result = chunk_markdown(content).unwrap();
        assert!(result.len() >= 1);
        assert!(result[0].content.contains("plain text"));
    }

    #[test]
    fn test_chunk_json_invalid_json() {
        let content = "not valid json at all";
        let result = chunk_json(content).unwrap();
        assert_eq!(result.len(), 1);
        assert!(result[0].content.contains("not valid json"));
    }

    #[test]
    fn test_uuid_simple_unique_ids() {
        let id1 = uuid_simple();
        let id2 = uuid_simple();
        assert_ne!(id1, id2);
        assert!(id1.starts_with("doc_"));
        assert!(id2.starts_with("doc_"));
    }

    #[test]
    fn test_extracted_entity_serialization_roundtrip() {
        let entity = ExtractedEntity {
            subject: "Alice".to_string(),
            predicate: "lives in".to_string(),
            object: "NYC".to_string(),
        };
        let json = serde_json::to_string(&entity).unwrap();
        let parsed: ExtractedEntity = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed.subject, "Alice");
        assert_eq!(parsed.predicate, "lives in");
        assert_eq!(parsed.object, "NYC");
    }

    #[test]
    fn test_document_chunk_serialization_roundtrip() {
        let chunk = DocumentChunk {
            id: "chunk_1".to_string(),
            content: "Test content".to_string(),
            metadata: serde_json::json!({"type": "test", "index": 0}),
        };
        let json = serde_json::to_string(&chunk).unwrap();
        let parsed: DocumentChunk = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed.id, "chunk_1");
        assert_eq!(parsed.content, "Test content");
    }

    #[test]
    fn test_ingestion_result_serialization_roundtrip() {
        let result = IngestionResult {
            chunk_count: 5,
            entity_count: 10,
            document_id: "doc_abc123".to_string(),
        };
        let json = serde_json::to_string(&result).unwrap();
        let parsed: IngestionResult = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed.chunk_count, 5);
        assert_eq!(parsed.entity_count, 10);
        assert_eq!(parsed.document_id, "doc_abc123");
    }
}
