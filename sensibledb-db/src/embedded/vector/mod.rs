use crate::embedded::error::Result;

#[derive(Debug, Clone)]
pub struct Vector {
    pub id: u128,
    pub data: Vec<f32>,
    pub metadata: Option<Vec<u8>>,
}

#[derive(Debug, Clone)]
pub struct VectorSearchResult {
    pub id: u128,
    pub score: f32,
    pub metadata: Option<Vec<u8>>,
}

pub trait VectorIndex: Send + Sync {
    fn insert(&self, vector: Vector) -> Result<()>;
    fn search(&self, query: &[f32], k: usize) -> Result<Vec<VectorSearchResult>>;
    fn delete(&self, id: u128) -> Result<()>;
    fn len(&self) -> Result<usize>;
    fn is_empty(&self) -> Result<bool>;
}

pub mod in_memory;
pub use in_memory::InMemoryVectorIndex;
