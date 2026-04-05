use crate::embedded::error::{Error, Result};
use crate::embedded::transaction::{Edge, Node};
use crate::storage::StorageBackend;

#[cfg(feature = "lmdb")]
use sensibledb_db::sensibledb_engine::storage_core::SensibleGraphStorage;

pub struct LmdbStorage {
    #[cfg(feature = "lmdb")]
    storage: SensibleGraphStorage,
}

#[cfg(feature = "lmdb")]
impl LmdbStorage {
    pub fn new(
        path: &str,
        config: sensibledb_db::sensibledb_engine::traversal_core::config::Config,
    ) -> Result<Self> {
        let version_info =
            sensibledb_db::sensibledb_engine::storage_core::version_info::VersionInfo::default();
        let storage = SensibleGraphStorage::new(path, config, version_info)
            .map_err(|e| Error::Storage(e.to_string()))?;
        Ok(Self { storage })
    }
}

#[cfg(feature = "lmdb")]
impl StorageBackend for LmdbStorage {
    fn get_node(&self, id: u128) -> Result<Option<Node>> {
        let txn = self
            .storage
            .graph_env
            .read_txn()
            .map_err(|e| Error::Storage(e.to_string()))?;
        let arena = bumpalo::Bump::new();
        match self.storage.get_node(&txn, &id, &arena) {
            Ok(node) => Ok(Some(Node {
                id: node.id,
                label: node.label.to_string(),
            })),
            Err(sensibledb_db::sensibledb_engine::types::GraphError::NodeNotFound) => Ok(None),
            Err(e) => Err(Error::Storage(e.to_string())),
        }
    }

    fn get_edge(&self, id: u128) -> Result<Option<Edge>> {
        let txn = self
            .storage
            .graph_env
            .read_txn()
            .map_err(|e| Error::Storage(e.to_string()))?;
        let arena = bumpalo::Bump::new();
        match self.storage.get_edge(&txn, &id, &arena) {
            Ok(edge) => Ok(Some(Edge {
                id: edge.id,
                label: edge.label.to_string(),
                from: edge.from_node,
                to: edge.to_node,
            })),
            Err(sensibledb_db::sensibledb_engine::types::GraphError::EdgeNotFound) => Ok(None),
            Err(e) => Err(Error::Storage(e.to_string())),
        }
    }

    fn put_node(&self, _node: Node) -> Result<()> {
        Err(Error::Generic(
            "LMDB storage: put_node requires sensibledb-db schema".into(),
        ))
    }

    fn put_edge(&self, _edge: Edge) -> Result<()> {
        Err(Error::Generic(
            "LMDB storage: put_edge requires sensibledb-db schema".into(),
        ))
    }

    fn delete_node(&self, id: u128) -> Result<()> {
        let mut txn = self
            .storage
            .graph_env
            .write_txn()
            .map_err(|e| Error::Storage(e.to_string()))?;
        self.storage
            .drop_node(&mut txn, &id)
            .map_err(|e| Error::Storage(e.to_string()))?;
        txn.commit().map_err(|e| Error::Storage(e.to_string()))
    }

    fn delete_edge(&self, id: u128) -> Result<()> {
        let mut txn = self
            .storage
            .graph_env
            .write_txn()
            .map_err(|e| Error::Storage(e.to_string()))?;
        self.storage
            .drop_edge(&mut txn, &id)
            .map_err(|e| Error::Storage(e.to_string()))?;
        txn.commit().map_err(|e| Error::Storage(e.to_string()))
    }

    fn scan_nodes(&self) -> Result<Vec<Node>> {
        Err(Error::Generic(
            "LMDB storage: scan_nodes requires iterator API".into(),
        ))
    }

    fn scan_edges(&self) -> Result<Vec<Edge>> {
        Err(Error::Generic(
            "LMDB storage: scan_edges requires iterator API".into(),
        ))
    }
}
