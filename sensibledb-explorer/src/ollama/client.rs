use reqwest::Client;
use serde::{Deserialize, Serialize};

const DEFAULT_OLLAMA_URL: &str = "http://localhost:11434";

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaModelInfo {
    pub name: String,
    pub size: u64,
    pub digest: String,
    pub modified_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaStatus {
    pub available: bool,
    pub url: String,
    pub version: Option<String>,
    pub models: Vec<OllamaModelInfo>,
}

#[derive(Debug, Serialize)]
pub struct EmbeddingRequest {
    pub model: String,
    pub input: String,
}

#[derive(Debug, Deserialize)]
pub struct EmbeddingResponse {
    pub embeddings: Vec<Vec<f32>>,
}

#[derive(Debug, Serialize)]
pub struct ChatRequest {
    pub model: String,
    pub messages: Vec<ChatMessage>,
    pub stream: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct ChatResponse {
    pub message: ChatMessage,
    pub done: bool,
}

#[derive(Debug, Serialize)]
pub struct PullRequest {
    pub name: String,
    pub stream: bool,
}

#[derive(Debug, Deserialize)]
pub struct PullProgress {
    pub status: String,
    pub completed: Option<u64>,
    pub total: Option<u64>,
    pub digest: Option<String>,
}

pub struct OllamaClient {
    client: Client,
    base_url: String,
}

impl OllamaClient {
    pub fn new(base_url: Option<String>) -> Self {
        Self {
            client: Client::new(),
            base_url: base_url.unwrap_or_else(|| DEFAULT_OLLAMA_URL.to_string()),
        }
    }

    pub async fn check_status(&self) -> Result<OllamaStatus, String> {
        let url = format!("{}/api/tags", self.base_url);
        let response = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Ollama not reachable at {}: {}", self.base_url, e))?;

        if !response.status().is_success() {
            return Err(format!(
                "Ollama returned HTTP {}",
                response.status()
            ));
        }

        let tags: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        let models = tags
            .get("models")
            .and_then(|m| m.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|m| {
                        Some(OllamaModelInfo {
                            name: m.get("name")?.as_str()?.to_string(),
                            size: m.get("size")?.as_u64()?,
                            digest: m.get("digest")?.as_str()?.to_string(),
                            modified_at: m.get("modified_at")?.as_str()?.to_string(),
                        })
                    })
                    .collect()
            })
            .unwrap_or_default();

        let version = tags
            .get("version")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string());

        Ok(OllamaStatus {
            available: true,
            url: self.base_url.clone(),
            version,
            models,
        })
    }

    pub async fn generate_embeddings(
        &self,
        model: &str,
        texts: Vec<String>,
    ) -> Result<Vec<Vec<f32>>, String> {
        let url = format!("{}/api/embed", self.base_url);

        let mut all_embeddings = Vec::new();

        for text in texts {
            let request = EmbeddingRequest {
                model: model.to_string(),
                input: text,
            };

            let response = self
                .client
                .post(&url)
                .json(&request)
                .send()
                .await
                .map_err(|e| format!("Embedding request failed: {}", e))?;

            if !response.status().is_success() {
                let status = response.status();
                let body = response
                    .text()
                    .await
                    .unwrap_or_else(|_| "No body".to_string());
                return Err(format!("Embedding HTTP {}: {}", status, body));
            }

            let result: EmbeddingResponse = response
                .json()
                .await
                .map_err(|e| format!("Failed to parse embedding response: {}", e))?;

            all_embeddings.extend(result.embeddings);
        }

        Ok(all_embeddings)
    }

    pub async fn chat_completion(
        &self,
        model: &str,
        messages: Vec<ChatMessage>,
    ) -> Result<String, String> {
        let url = format!("{}/api/chat", self.base_url);

        let request = ChatRequest {
            model: model.to_string(),
            messages,
            stream: false,
        };

        let response = self
            .client
            .post(&url)
            .json(&request)
            .send()
            .await
            .map_err(|e| format!("Chat request failed: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response
                .text()
                .await
                .unwrap_or_else(|_| "No body".to_string());
            return Err(format!("Chat HTTP {}: {}", status, body));
        }

        let result: ChatResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse chat response: {}", e))?;

        Ok(result.message.content)
    }

    pub async fn pull_model(
        &self,
        model: &str,
    ) -> Result<Vec<PullProgress>, String> {
        let url = format!("{}/api/pull", self.base_url);

        let request = PullRequest {
            name: model.to_string(),
            stream: true,
        };

        let response = self
            .client
            .post(&url)
            .json(&request)
            .send()
            .await
            .map_err(|e| format!("Pull request failed: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response
                .text()
                .await
                .unwrap_or_else(|_| "No body".to_string());
            return Err(format!("Pull HTTP {}: {}", status, body));
        }

        let body = response
            .text()
            .await
            .map_err(|e| format!("Failed to read pull response: {}", e))?;

        let mut progress_updates = Vec::new();
        for line in body.lines() {
            if line.trim().is_empty() {
                continue;
            }
            if let Ok(progress) = serde_json::from_str::<PullProgress>(line) {
                progress_updates.push(progress);
            }
        }

        Ok(progress_updates)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ollama_client_new_default_url() {
        let client = OllamaClient::new(None);
        assert_eq!(client.base_url, DEFAULT_OLLAMA_URL);
    }

    #[test]
    fn test_ollama_client_new_custom_url() {
        let custom_url = "http://192.168.1.100:8080";
        let client = OllamaClient::new(Some(custom_url.to_string()));
        assert_eq!(client.base_url, custom_url);
    }

    #[test]
    fn test_embedding_request_serialization() {
        let request = EmbeddingRequest {
            model: "nomic-embed-text".to_string(),
            input: "Hello, world!".to_string(),
        };
        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("\"model\":\"nomic-embed-text\""));
        assert!(json.contains("\"input\":\"Hello, world!\""));
    }

    #[test]
    fn test_chat_request_serialization() {
        let request = ChatRequest {
            model: "llama3:8b".to_string(),
            messages: vec![
                ChatMessage {
                    role: "system".to_string(),
                    content: "You are a helpful assistant.".to_string(),
                },
                ChatMessage {
                    role: "user".to_string(),
                    content: "Hello!".to_string(),
                },
            ],
            stream: false,
        };
        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("\"model\":\"llama3:8b\""));
        assert!(json.contains("\"stream\":false"));
    }

    #[test]
    fn test_pull_request_serialization() {
        let request = PullRequest {
            name: "llama3:8b".to_string(),
            stream: true,
        };
        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("\"name\":\"llama3:8b\""));
        assert!(json.contains("\"stream\":true"));
    }

    #[test]
    fn test_pull_progress_deserialization() {
        let json = r#"{"status":"pulling manifest","completed":1024,"total":2048,"digest":"sha256:abc123"}"#;
        let progress: PullProgress = serde_json::from_str(json).unwrap();
        assert_eq!(progress.status, "pulling manifest");
        assert_eq!(progress.completed, Some(1024));
    }

    #[test]
    fn test_pull_progress_partial_fields() {
        let json = r#"{"status":"downloading"}"#;
        let progress: PullProgress = serde_json::from_str(json).unwrap();
        assert_eq!(progress.status, "downloading");
        assert_eq!(progress.completed, None);
    }

    #[test]
    fn test_chat_response_deserialization() {
        let json = r#"{"message":{"role":"assistant","content":"Hello!"},"done":true}"#;
        let response: ChatResponse = serde_json::from_str(json).unwrap();
        assert_eq!(response.message.role, "assistant");
        assert_eq!(response.message.content, "Hello!");
        assert!(response.done);
    }

    #[test]
    fn test_embedding_response_deserialization() {
        let json = r#"{"embeddings":[[0.1,0.2,0.3],[0.4,0.5,0.6]]}"#;
        let response: EmbeddingResponse = serde_json::from_str(json).unwrap();
        assert_eq!(response.embeddings.len(), 2);
    }

    #[test]
    fn test_ollama_status_deserialization() {
        let json = r#"{"models":[{"name":"llama3:8b","size":3826790912,"digest":"sha256:abc","modified_at":"2024-01-15T10:30:00Z"}],"version":"0.1.20","available":true,"url":"http://localhost:11434"}"#;
        let status: OllamaStatus = serde_json::from_str(json).unwrap();
        assert_eq!(status.models.len(), 1);
        assert_eq!(status.version, Some("0.1.20".to_string()));
    }

    #[test]
    fn test_ollama_model_info_deserialization() {
        let json = r#"{"name":"qwen2.5-coder:3b","size":2748098560,"digest":"sha256:xyz","modified_at":"2024-02-01T12:00:00Z"}"#;
        let model: OllamaModelInfo = serde_json::from_str(json).unwrap();
        assert_eq!(model.name, "qwen2.5-coder:3b");
        assert_eq!(model.size, 2748098560);
    }
}
