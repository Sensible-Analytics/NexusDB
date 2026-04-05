use crate::embedded::error::Result;
use crate::embedded::transaction::{Edge, Node};

pub trait StorageBackend: Send + Sync {
    fn get_node(&self, id: u128) -> Result<Option<Node>>;
    fn get_edge(&self, id: u128) -> Result<Option<Edge>>;
    fn put_node(&self, node: Node) -> Result<()>;
    fn put_edge(&self, edge: Edge) -> Result<()>;
    fn delete_node(&self, id: u128) -> Result<()>;
    fn delete_edge(&self, id: u128) -> Result<()>;
    fn scan_nodes(&self) -> Result<Vec<Node>>;
    fn scan_edges(&self) -> Result<Vec<Edge>>;
}

pub mod in_memory;
pub use in_memory::InMemoryStorage;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_storage_backend_trait_object() {
        let storage = InMemoryStorage::new();
        let boxed: Box<dyn StorageBackend> = Box::new(storage);
        assert!(boxed.get_node(1).is_ok());
    }

    #[test]
    fn test_in_memory_storage_implements_trait() {
        fn check_storage<T: StorageBackend>() {}
        check_storage::<InMemoryStorage>();
    }
}
