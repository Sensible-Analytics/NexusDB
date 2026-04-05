use crate::embedded::error::Result;
use crate::embedded::transaction::{Edge, Node};

#[derive(Debug, Clone)]
pub struct TraversalOptions {
    pub max_depth: usize,
    pub limit: Option<usize>,
    pub include_edges: bool,
}

impl Default for TraversalOptions {
    fn default() -> Self {
        Self {
            max_depth: 10,
            limit: None,
            include_edges: true,
        }
    }
}

#[derive(Debug, Clone)]
pub struct TraversalResult {
    pub nodes: Vec<Node>,
    pub edges: Vec<Edge>,
    pub paths: Vec<Vec<u128>>,
}

pub trait GraphTraversal: Send + Sync {
    fn traverse_bfs(&self, start_id: u128, options: TraversalOptions) -> Result<TraversalResult>;
    fn traverse_dfs(&self, start_id: u128, options: TraversalOptions) -> Result<TraversalResult>;
    fn get_out_neighbors(&self, node_id: u128) -> Result<Vec<Node>>;
    fn get_in_neighbors(&self, node_id: u128) -> Result<Vec<Node>>;
    fn get_out_edges(&self, node_id: u128) -> Result<Vec<Edge>>;
    fn get_in_edges(&self, node_id: u128) -> Result<Vec<Edge>>;
    fn find_paths(&self, from_id: u128, to_id: u128, max_length: usize) -> Result<Vec<Vec<u128>>>;
}

pub mod in_memory;

pub use in_memory::InMemoryGraphTraversal;
