use crate::ollama::client::{OllamaClient, ChatMessage};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct OllamaStatusResult {
    pub available: bool,
    pub url: String,
    pub version: Option<String>,
    pub models: Vec<ModelInfo>,
}

#[derive(Serialize, Deserialize)]
pub struct ModelInfo {
    pub name: String,
    pub size: u64,
    pub digest: String,
    pub modified_at: String,
}

#[derive(Serialize, Deserialize)]
pub struct PullProgressResult {
    pub status: String,
    pub percent: f64,
}

#[derive(Deserialize)]
pub struct EmbeddingRequest {
    pub model: String,
    pub texts: Vec<String>,
}

#[derive(Serialize)]
pub struct EmbeddingResult {
    pub embeddings: Vec<Vec<f32>>,
}

#[derive(Deserialize)]
pub struct NLToSensibleQLRequest {
    pub query: String,
    pub schema_info: Option<String>,
    pub db_name: String,
}

#[derive(Serialize)]
pub struct NLToSensibleQLResult {
    pub sensibleql: String,
    pub explanation: String,
}

#[tauri::command]
pub async fn ollama_check_status(ollama_url: Option<String>) -> Result<OllamaStatusResult, String> {
    let client = OllamaClient::new(ollama_url);
    let status = client.check_status().await?;
    Ok(OllamaStatusResult {
        available: status.available,
        url: status.url,
        version: status.version,
        models: status.models.into_iter().map(|m| ModelInfo {
            name: m.name,
            size: m.size,
            digest: m.digest,
            modified_at: m.modified_at,
        }).collect(),
    })
}

#[tauri::command]
pub async fn ollama_pull_model(model: String, ollama_url: Option<String>) -> Result<Vec<PullProgressResult>, String> {
    let client = OllamaClient::new(ollama_url);
    let progress: Vec<crate::ollama::client::PullProgress> = client.pull_model(&model).await?;
    Ok(progress.into_iter().map(|p| {
        let percent = match (&p.completed, &p.total) {
            (Some(c), Some(t)) if *t > 0 => (*c as f64 / *t as f64) * 100.0,
            _ => 0.0,
        };
        PullProgressResult {
            status: p.status,
            percent,
        }
    }).collect())
}

#[tauri::command]
pub async fn generate_embeddings(
    request: EmbeddingRequest,
    ollama_url: Option<String>,
) -> Result<EmbeddingResult, String> {
    let client = OllamaClient::new(ollama_url);
    let embeddings = client.generate_embeddings(&request.model, request.texts).await?;
    Ok(EmbeddingResult { embeddings })
}

#[tauri::command]
pub async fn translate_nl_to_sensibleql(
    request: NLToSensibleQLRequest,
    model: Option<String>,
    ollama_url: Option<String>,
) -> Result<NLToSensibleQLResult, String> {
    let model_name = model.unwrap_or_else(|| "qwen2.5-coder:3b".to_string());
    let client = OllamaClient::new(ollama_url);

    let schema_context = request.schema_info
        .map(|s| format!("\nDatabase Schema:\n{}", s))
        .unwrap_or_default();

    let system_prompt = format!(
        "You are a SensibleQL expert. SensibleQL is a graph query language similar to Cypher. \
         Convert natural language questions into SensibleQL queries.\n\
         \nSensibleQL Syntax Examples:\n\
         - MATCH (n) RETURN n  -- Get all nodes\n\
         - MATCH (n:Person) RETURN n  -- Get all Person nodes\n\
         - MATCH (n:Person)-[r]-(m) RETURN n, r, m  -- Get Person connections\n\
         - MATCH (n:Person)--(m:Task) RETURN n, m  -- Get Person-Task relationships\n\
         - COUNT nodes  -- Count all nodes\n\
         - COUNT edges  -- Count all edges\n\
         - MATCH (n:Symptom)<-[r]-(m) RETURN n, r, m  -- Get what causes a symptom\n\
         \nNode labels use format Type:Name (e.g., Person:Alice, Task:DesignMockups)\n\
         Edge labels are uppercase (e.g., WORKS_AT, TRIGGERED, BLOCKS, OWNS)\n\
         \nReturn ONLY the SensibleQL query, nothing else. If you cannot convert, return the original question.{}",
        schema_context
    );

    let messages = vec![
        ChatMessage {
            role: "system".to_string(),
            content: system_prompt,
        },
        ChatMessage {
            role: "user".to_string(),
            content: format!("Convert this to SensibleQL: {}", request.query),
        },
    ];

    let response: String = client.chat_completion(&model_name, messages).await?;

    let sensibleql = response.trim().to_string();

    let explanation = generate_explanation(&sensibleql, &request.query);

    Ok(NLToSensibleQLResult {
        sensibleql,
        explanation,
    })
}

fn generate_explanation(sensibleql: &str, _query: &str) -> String {
    let lower = sensibleql.to_lowercase();
    if lower.starts_with("match") {
        if lower.contains("count") {
            "Counting matching nodes/edges".to_string()
        } else if lower.contains(")-[") || lower.contains("]-(") {
            "Finding connected nodes and relationships".to_string()
        } else if let Some(label) = extract_label(sensibleql) {
            format!("Retrieving all {} nodes", label)
        } else {
            "Retrieving graph data".to_string()
        }
    } else if lower.starts_with("count") {
        if lower.contains("edge") {
            "Counting all edges in the graph".to_string()
        } else {
            "Counting all nodes in the graph".to_string()
        }
    } else {
        "Executing query".to_string()
    }
}

fn extract_label(query: &str) -> Option<String> {
    if let Some(start) = query.find(':') {
        let rest = &query[start + 1..];
        let end = rest.find(|c: char| !c.is_alphanumeric() && c != '_').unwrap_or(rest.len());
        if end > 0 {
            return Some(rest[..end].to_string());
        }
    }
    None
}
