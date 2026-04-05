use crate::embedded::error::{Error, Result};
use crate::embedded::vector::{Vector, VectorIndex, VectorSearchResult};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

pub struct InMemoryVectorIndex {
    vectors: Arc<RwLock<HashMap<u128, Vector>>>,
}

impl InMemoryVectorIndex {
    pub fn new() -> Self {
        Self {
            vectors: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

impl Default for InMemoryVectorIndex {
    fn default() -> Self {
        Self::new()
    }
}

impl VectorIndex for InMemoryVectorIndex {
    fn insert(&self, vector: Vector) -> Result<()> {
        let mut vectors = self
            .vectors
            .write()
            .map_err(|_| Error::Generic("Failed to acquire write lock".into()))?;
        vectors.insert(vector.id, vector);
        Ok(())
    }

    fn search(&self, query: &[f32], k: usize) -> Result<Vec<VectorSearchResult>> {
        let vectors = self
            .vectors
            .read()
            .map_err(|_| Error::Generic("Failed to acquire read lock".into()))?;

        let mut results: Vec<VectorSearchResult> = vectors
            .values()
            .map(|v| {
                let score = cosine_similarity(query, &v.data);
                VectorSearchResult {
                    id: v.id,
                    score,
                    metadata: v.metadata.clone(),
                }
            })
            .collect();

        results.sort_by(|a, b| {
            b.score
                .partial_cmp(&a.score)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        results.truncate(k);
        Ok(results)
    }

    fn delete(&self, id: u128) -> Result<()> {
        let mut vectors = self
            .vectors
            .write()
            .map_err(|_| Error::Generic("Failed to acquire write lock".into()))?;
        vectors.remove(&id);
        Ok(())
    }

    fn len(&self) -> Result<usize> {
        let vectors = self
            .vectors
            .read()
            .map_err(|_| Error::Generic("Failed to acquire read lock".into()))?;
        Ok(vectors.len())
    }

    fn is_empty(&self) -> Result<bool> {
        let vectors = self
            .vectors
            .read()
            .map_err(|_| Error::Generic("Failed to acquire read lock".into()))?;
        Ok(vectors.is_empty())
    }
}

fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    if a.len() != b.len() || a.is_empty() {
        return 0.0;
    }

    let dot_product: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();

    if norm_a == 0.0 || norm_b == 0.0 {
        return 0.0;
    }

    dot_product / (norm_a * norm_b)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_insert_and_search() {
        let index = InMemoryVectorIndex::new();

        index
            .insert(Vector {
                id: 1,
                data: vec![1.0, 0.0, 0.0],
                metadata: None,
            })
            .unwrap();

        index
            .insert(Vector {
                id: 2,
                data: vec![0.0, 1.0, 0.0],
                metadata: None,
            })
            .unwrap();

        let results = index.search(&[1.0, 0.0, 0.0], 1).unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].id, 1);
    }

    #[test]
    fn test_cosine_similarity() {
        let a = vec![1.0, 0.0, 0.0];
        let b = vec![1.0, 0.0, 0.0];
        assert!((cosine_similarity(&a, &b) - 1.0).abs() < 0.0001);

        let c = vec![0.0, 1.0, 0.0];
        assert!((cosine_similarity(&a, &c) - 0.0).abs() < 0.0001);
    }
}
