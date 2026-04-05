use crate::embedded::error::{Error, Result};
use crate::embedded::storage::StorageBackend;
use crate::embedded::transaction::{Edge, Node};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

pub struct InMemoryStorage {
    nodes: Arc<RwLock<HashMap<u128, Node>>>,
    edges: Arc<RwLock<HashMap<u128, Edge>>>,
}

impl InMemoryStorage {
    pub fn new() -> Self {
        Self {
            nodes: Arc::new(RwLock::new(HashMap::new())),
            edges: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

impl Default for InMemoryStorage {
    fn default() -> Self {
        Self::new()
    }
}

impl StorageBackend for InMemoryStorage {
    fn get_node(&self, id: u128) -> Result<Option<Node>> {
        let nodes = self
            .nodes
            .read()
            .map_err(|_| Error::Generic("Failed to acquire read lock".into()))?;
        Ok(nodes.get(&id).cloned())
    }

    fn get_edge(&self, id: u128) -> Result<Option<Edge>> {
        let edges = self
            .edges
            .read()
            .map_err(|_| Error::Generic("Failed to acquire read lock".into()))?;
        Ok(edges.get(&id).cloned())
    }

    fn put_node(&self, node: Node) -> Result<()> {
        let mut nodes = self
            .nodes
            .write()
            .map_err(|_| Error::Generic("Failed to acquire write lock".into()))?;
        nodes.insert(node.id, node);
        Ok(())
    }

    fn put_edge(&self, edge: Edge) -> Result<()> {
        let mut edges = self
            .edges
            .write()
            .map_err(|_| Error::Generic("Failed to acquire write lock".into()))?;
        edges.insert(edge.id, edge);
        Ok(())
    }

    fn delete_node(&self, id: u128) -> Result<()> {
        let mut nodes = self
            .nodes
            .write()
            .map_err(|_| Error::Generic("Failed to acquire write lock".into()))?;
        nodes.remove(&id);
        Ok(())
    }

    fn delete_edge(&self, id: u128) -> Result<()> {
        let mut edges = self
            .edges
            .write()
            .map_err(|_| Error::Generic("Failed to acquire write lock".into()))?;
        edges.remove(&id);
        Ok(())
    }

    fn scan_nodes(&self) -> Result<Vec<Node>> {
        let nodes = self
            .nodes
            .read()
            .map_err(|_| Error::Generic("Failed to acquire read lock".into()))?;
        Ok(nodes.values().cloned().collect())
    }

    fn scan_edges(&self) -> Result<Vec<Edge>> {
        let edges = self
            .edges
            .read()
            .map_err(|_| Error::Generic("Failed to acquire read lock".into()))?;
        Ok(edges.values().cloned().collect())
    }
}
