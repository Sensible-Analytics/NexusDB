use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Arc;

use crate::embedded::config::Config;
use crate::embedded::error::{Error, Result};
use crate::embedded::transaction::{
    InMemoryReadTransaction, InMemoryStorage, InMemoryWriteTransaction, ReadTransaction,
    WriteTransaction,
};

/// Main database handle for SensibleDB embedded mode.
///
/// Provides methods for creating transactions and basic CRUD operations.
pub struct Database {
    config: Arc<Config>,
    path: PathBuf,
    is_open: bool,
    storage: Arc<InMemoryStorage>,
}

impl Database {
    pub fn open<P: AsRef<Path>>(path: P) -> Result<Self> {
        Self::open_with_config(path, Config::default())
    }

    pub fn open_with_config<P: AsRef<Path>>(path: P, config: Config) -> Result<Self> {
        let path = path.as_ref().to_path_buf();

        if path.exists() && !path.is_dir() && !path.is_file() {
            return Err(Error::InvalidParameter(
                "Path exists but is neither a directory nor a file".into(),
            ));
        }

        if !path.exists() {
            if config.read_only {
                return Err(Error::NotFound(format!("Database not found at {:?}", path)));
            }
            fs::create_dir_all(&path).map_err(|e| Error::Io(e.to_string()))?;
        }

        Ok(Self {
            config: Arc::new(config),
            path,
            is_open: true,
            storage: Arc::new(InMemoryStorage::new()),
        })
    }

    pub fn open_memory() -> Result<Self> {
        let temp_dir = tempfile::tempdir().map_err(|e| Error::Io(e.to_string()))?;
        Self::open(temp_dir.path().join("memory.nxdb"))
    }

    pub fn read_transaction(&self) -> Result<InMemoryReadTransaction> {
        if !self.is_open {
            return Err(Error::Generic("Database is not open".into()));
        }
        Ok(InMemoryReadTransaction::new(self.storage.clone()))
    }

    pub fn write_transaction(&self) -> Result<InMemoryWriteTransaction> {
        if !self.is_open {
            return Err(Error::Generic("Database is not open".into()));
        }
        if self.config.read_only {
            return Err(Error::ReadOnly);
        }
        Ok(InMemoryWriteTransaction::new(self.storage.clone()))
    }

    pub fn get_node(&self, id: u128) -> Result<Option<crate::embedded::transaction::Node>> {
        let tx = self.read_transaction()?;
        tx.get_node(id)
    }

    pub fn put_node(&self, node: crate::embedded::transaction::Node) -> Result<()> {
        let mut tx = self.write_transaction()?;
        tx.put_node(node)?;
        tx.commit()
    }

    pub fn delete_node(&self, id: u128) -> Result<()> {
        let mut tx = self.write_transaction()?;
        tx.delete_node(id)?;
        tx.commit()
    }

    pub fn get_edge(&self, id: u128) -> Result<Option<crate::embedded::transaction::Edge>> {
        let tx = self.read_transaction()?;
        tx.get_edge(id)
    }

    pub fn put_edge(&self, edge: crate::embedded::transaction::Edge) -> Result<()> {
        let mut tx = self.write_transaction()?;
        tx.put_edge(edge)?;
        tx.commit()
    }

    pub fn delete_edge(&self, id: u128) -> Result<()> {
        let mut tx = self.write_transaction()?;
        tx.delete_edge(id)?;
        tx.commit()
    }

    pub fn path(&self) -> &Path {
        &self.path
    }

    pub fn config(&self) -> &Config {
        &self.config
    }

    pub fn is_read_only(&self) -> bool {
        self.config.read_only
    }

    pub fn is_open(&self) -> bool {
        self.is_open
    }

    pub fn close(&mut self) -> Result<()> {
        if !self.is_open {
            return Err(Error::Generic("Database is not open".into()));
        }
        self.is_open = false;
        Ok(())
    }
}

impl Drop for Database {
    fn drop(&mut self) {
        if self.is_open {
            self.is_open = false;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::embedded::transaction::{Edge, Node, ReadTransaction, WriteTransaction};

    #[test]
    fn test_open_new_database() {
        let temp_dir = tempfile::tempdir().unwrap();
        let db = Database::open(temp_dir.path().join("test.nxdb"));
        assert!(db.is_ok());
        let db = db.unwrap();
        assert!(db.is_open());
        assert!(db.path().exists());
    }

    #[test]
    fn test_open_memory() {
        let db = Database::open_memory();
        assert!(db.is_ok());
        let db = db.unwrap();
        assert!(db.is_open());
    }

    #[test]
    fn test_open_read_only_nonexistent() {
        let temp_dir = tempfile::tempdir().unwrap();
        let config = Config::default().with_read_only(true);
        let db = Database::open_with_config(temp_dir.path().join("nonexistent.nxdb"), config);
        assert!(matches!(db, Err(Error::NotFound(_))));
    }

    #[test]
    fn test_close() {
        let temp_dir = tempfile::tempdir().unwrap();
        let mut db = Database::open(temp_dir.path().join("test.nxdb")).unwrap();
        assert!(db.is_open());
        db.close().unwrap();
        assert!(!db.is_open());
    }

    #[test]
    fn test_close_twice() {
        let temp_dir = tempfile::tempdir().unwrap();
        let mut db = Database::open(temp_dir.path().join("test.nxdb")).unwrap();
        db.close().unwrap();
        let result = db.close();
        assert!(matches!(result, Err(Error::Generic(_))));
    }

    #[test]
    fn test_read_transaction_when_closed() {
        let temp_dir = tempfile::tempdir().unwrap();
        let mut db = Database::open(temp_dir.path().join("test.nxdb")).unwrap();
        db.close().unwrap();
        let result = db.read_transaction();
        assert!(matches!(result, Err(Error::Generic(_))));
    }

    #[test]
    fn test_write_transaction_read_only() {
        let temp_dir = tempfile::tempdir().unwrap();
        let path = temp_dir.path().join("test.nxdb");
        Database::open(&path).unwrap();
        let config = Config::default().with_read_only(true);
        let db = Database::open_with_config(&path, config).unwrap();
        let result = db.write_transaction();
        assert!(matches!(result, Err(Error::ReadOnly)));
    }

    #[test]
    fn test_config_accessors() {
        let temp_dir = tempfile::tempdir().unwrap();
        let config = Config::default().with_max_size(5);
        let db = Database::open_with_config(temp_dir.path().join("test.nxdb"), config).unwrap();
        assert_eq!(db.config().max_size_gb, 5);
        assert!(!db.is_read_only());
    }

    #[test]
    fn test_write_and_read_node() {
        let db = Database::open_memory().unwrap();
        let mut tx = db.write_transaction().unwrap();
        let node = Node {
            id: 1,
            label: "TestNode".to_string(),
        };
        tx.put_node(node.clone()).unwrap();
        tx.commit().unwrap();

        let tx = db.read_transaction().unwrap();
        let found = tx.get_node(1).unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().label, "TestNode");
    }

    #[test]
    fn test_write_and_read_edge() {
        let db = Database::open_memory().unwrap();
        let mut tx = db.write_transaction().unwrap();
        let edge = Edge {
            id: 1,
            label: "TEST_EDGE".to_string(),
            from: 1,
            to: 2,
        };
        tx.put_edge(edge.clone()).unwrap();
        tx.commit().unwrap();

        let tx = db.read_transaction().unwrap();
        let found = tx.get_edge(1).unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().from, 1);
    }

    #[test]
    fn test_delete_node() {
        let db = Database::open_memory().unwrap();
        let mut tx = db.write_transaction().unwrap();
        tx.put_node(Node {
            id: 1,
            label: "Test".to_string(),
        })
        .unwrap();
        tx.commit().unwrap();

        let mut tx = db.write_transaction().unwrap();
        tx.delete_node(1).unwrap();
        tx.commit().unwrap();

        let tx = db.read_transaction().unwrap();
        let found = tx.get_node(1).unwrap();
        assert!(found.is_none());
    }

    #[test]
    fn test_scan_nodes() {
        let db = Database::open_memory().unwrap();
        let mut tx = db.write_transaction().unwrap();
        for i in 0..5 {
            tx.put_node(Node {
                id: i,
                label: format!("Node{}", i),
            })
            .unwrap();
        }
        tx.commit().unwrap();

        let tx = db.read_transaction().unwrap();
        let nodes = tx.scan_nodes().unwrap();
        assert_eq!(nodes.len(), 5);
    }

    #[test]
    fn test_crud_get_node() {
        let db = Database::open_memory().unwrap();
        db.put_node(Node {
            id: 1,
            label: "Test".to_string(),
        })
        .unwrap();

        let found = db.get_node(1).unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().label, "Test");
    }

    #[test]
    fn test_crud_put_node() {
        let db = Database::open_memory().unwrap();
        db.put_node(Node {
            id: 1,
            label: "CRUD Test".to_string(),
        })
        .unwrap();

        let found = db.get_node(1).unwrap();
        assert!(found.is_some());
    }

    #[test]
    fn test_crud_delete_node() {
        let db = Database::open_memory().unwrap();
        db.put_node(Node {
            id: 1,
            label: "ToDelete".to_string(),
        })
        .unwrap();

        db.delete_node(1).unwrap();

        let found = db.get_node(1).unwrap();
        assert!(found.is_none());
    }

    #[test]
    fn test_crud_put_edge() {
        let db = Database::open_memory().unwrap();
        db.put_edge(Edge {
            id: 1,
            label: "TEST".to_string(),
            from: 1,
            to: 2,
        })
        .unwrap();

        let found = db.get_edge(1).unwrap();
        assert!(found.is_some());
    }

    #[test]
    fn test_crud_delete_edge() {
        let db = Database::open_memory().unwrap();
        db.put_edge(Edge {
            id: 1,
            label: "TEST".to_string(),
            from: 1,
            to: 2,
        })
        .unwrap();

        db.delete_edge(1).unwrap();

        let found = db.get_edge(1).unwrap();
        assert!(found.is_none());
    }
}
