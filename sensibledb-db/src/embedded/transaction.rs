use crate::embedded::error::{Error, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

/// Represents a node in the graph.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Node {
    pub id: u128,
    pub label: String,
}

/// Represents an edge (relationship) between two nodes.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Edge {
    pub id: u128,
    pub label: String,
    pub from: u128,
    pub to: u128,
}

/// Trait for read-only database transactions.
pub trait ReadTransaction {
    fn get_node(&self, id: u128) -> Result<Option<Node>>;
    fn get_edge(&self, id: u128) -> Result<Option<Edge>>;
    fn scan_nodes(&self) -> Result<Vec<Node>>;
    fn scan_edges(&self) -> Result<Vec<Edge>>;
}

/// Trait for read-write database transactions.
pub trait WriteTransaction: ReadTransaction {
    fn put_node(&mut self, node: Node) -> Result<()>;
    fn put_edge(&mut self, edge: Edge) -> Result<()>;
    fn delete_node(&mut self, id: u128) -> Result<()>;
    fn delete_edge(&mut self, id: u128) -> Result<()>;
    fn commit(self) -> Result<()>;
}

#[derive(Clone)]
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

pub struct InMemoryReadTransaction {
    storage: Arc<InMemoryStorage>,
}

impl InMemoryReadTransaction {
    pub fn new(storage: Arc<InMemoryStorage>) -> Self {
        Self { storage }
    }
}

impl ReadTransaction for InMemoryReadTransaction {
    fn get_node(&self, id: u128) -> Result<Option<Node>> {
        let nodes = self
            .storage
            .nodes
            .read()
            .map_err(|_| Error::Generic("Failed to acquire read lock on nodes".into()))?;
        Ok(nodes.get(&id).cloned())
    }

    fn get_edge(&self, id: u128) -> Result<Option<Edge>> {
        let edges = self
            .storage
            .edges
            .read()
            .map_err(|_| Error::Generic("Failed to acquire read lock on edges".into()))?;
        Ok(edges.get(&id).cloned())
    }

    fn scan_nodes(&self) -> Result<Vec<Node>> {
        let nodes = self
            .storage
            .nodes
            .read()
            .map_err(|_| Error::Generic("Failed to acquire read lock on nodes".into()))?;
        Ok(nodes.values().cloned().collect())
    }

    fn scan_edges(&self) -> Result<Vec<Edge>> {
        let edges = self
            .storage
            .edges
            .read()
            .map_err(|_| Error::Generic("Failed to acquire read lock on edges".into()))?;
        Ok(edges.values().cloned().collect())
    }
}

pub struct InMemoryWriteTransaction {
    storage: Arc<InMemoryStorage>,
    committed: bool,
}

impl InMemoryWriteTransaction {
    pub fn new(storage: Arc<InMemoryStorage>) -> Self {
        Self {
            storage,
            committed: false,
        }
    }
}

impl ReadTransaction for InMemoryWriteTransaction {
    fn get_node(&self, id: u128) -> Result<Option<Node>> {
        let nodes = self
            .storage
            .nodes
            .read()
            .map_err(|_| Error::Generic("Failed to acquire read lock on nodes".into()))?;
        Ok(nodes.get(&id).cloned())
    }

    fn get_edge(&self, id: u128) -> Result<Option<Edge>> {
        let edges = self
            .storage
            .edges
            .read()
            .map_err(|_| Error::Generic("Failed to acquire read lock on edges".into()))?;
        Ok(edges.get(&id).cloned())
    }

    fn scan_nodes(&self) -> Result<Vec<Node>> {
        let nodes = self
            .storage
            .nodes
            .read()
            .map_err(|_| Error::Generic("Failed to acquire read lock on nodes".into()))?;
        Ok(nodes.values().cloned().collect())
    }

    fn scan_edges(&self) -> Result<Vec<Edge>> {
        let edges = self
            .storage
            .edges
            .read()
            .map_err(|_| Error::Generic("Failed to acquire read lock on edges".into()))?;
        Ok(edges.values().cloned().collect())
    }
}

impl WriteTransaction for InMemoryWriteTransaction {
    fn put_node(&mut self, node: Node) -> Result<()> {
        let mut nodes = self
            .storage
            .nodes
            .write()
            .map_err(|_| Error::Generic("Failed to acquire write lock on nodes".into()))?;
        nodes.insert(node.id, node);
        Ok(())
    }

    fn put_edge(&mut self, edge: Edge) -> Result<()> {
        let mut edges = self
            .storage
            .edges
            .write()
            .map_err(|_| Error::Generic("Failed to acquire write lock on edges".into()))?;
        edges.insert(edge.id, edge);
        Ok(())
    }

    fn delete_node(&mut self, id: u128) -> Result<()> {
        let mut nodes = self
            .storage
            .nodes
            .write()
            .map_err(|_| Error::Generic("Failed to acquire write lock on nodes".into()))?;
        nodes.remove(&id);
        Ok(())
    }

    fn delete_edge(&mut self, id: u128) -> Result<()> {
        let mut edges = self
            .storage
            .edges
            .write()
            .map_err(|_| Error::Generic("Failed to acquire write lock on edges".into()))?;
        edges.remove(&id);
        Ok(())
    }

    fn commit(mut self) -> Result<()> {
        self.committed = true;
        Ok(())
    }
}

impl Drop for InMemoryWriteTransaction {
    fn drop(&mut self) {}
}

pub struct DummyReadTransaction;

impl ReadTransaction for DummyReadTransaction {
    fn get_node(&self, _id: u128) -> Result<Option<Node>> {
        Err(Error::Generic("Not yet implemented".into()))
    }
    fn get_edge(&self, _id: u128) -> Result<Option<Edge>> {
        Err(Error::Generic("Not yet implemented".into()))
    }
    fn scan_nodes(&self) -> Result<Vec<Node>> {
        Err(Error::Generic("Not yet implemented".into()))
    }
    fn scan_edges(&self) -> Result<Vec<Edge>> {
        Err(Error::Generic("Not yet implemented".into()))
    }
}

pub struct DummyWriteTransaction;

impl ReadTransaction for DummyWriteTransaction {
    fn get_node(&self, _id: u128) -> Result<Option<Node>> {
        Err(Error::Generic("Not yet implemented".into()))
    }
    fn get_edge(&self, _id: u128) -> Result<Option<Edge>> {
        Err(Error::Generic("Not yet implemented".into()))
    }
    fn scan_nodes(&self) -> Result<Vec<Node>> {
        Err(Error::Generic("Not yet implemented".into()))
    }
    fn scan_edges(&self) -> Result<Vec<Edge>> {
        Err(Error::Generic("Not yet implemented".into()))
    }
}

impl WriteTransaction for DummyWriteTransaction {
    fn put_node(&mut self, _node: Node) -> Result<()> {
        Err(Error::Generic("Not yet implemented".into()))
    }
    fn put_edge(&mut self, _edge: Edge) -> Result<()> {
        Err(Error::Generic("Not yet implemented".into()))
    }
    fn delete_node(&mut self, _id: u128) -> Result<()> {
        Err(Error::Generic("Not yet implemented".into()))
    }
    fn delete_edge(&mut self, _id: u128) -> Result<()> {
        Err(Error::Generic("Not yet implemented".into()))
    }
    fn commit(self) -> Result<()> {
        Err(Error::Generic("Not yet implemented".into()))
    }
}
