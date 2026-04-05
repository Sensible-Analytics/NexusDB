use crate::embedded::error::Result;
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct IndexConfig {
    pub name: String,
    pub unique: bool,
}

pub trait SecondaryIndex: Send + Sync {
    fn insert(&mut self, key: &[u8], node_id: u128) -> Result<()>;
    fn remove(&mut self, key: &[u8], node_id: u128) -> Result<()>;
    fn lookup(&self, key: &[u8]) -> Result<Vec<u128>>;
    fn range_scan(&self, start: &[u8], end: &[u8]) -> Result<Vec<u128>>;
}

pub struct InMemorySecondaryIndex {
    name: String,
    unique: bool,
    index: HashMap<Vec<u8>, Vec<u128>>,
}

impl InMemorySecondaryIndex {
    pub fn new(name: String, unique: bool) -> Self {
        Self {
            name,
            unique,
            index: HashMap::new(),
        }
    }
}

impl SecondaryIndex for InMemorySecondaryIndex {
    fn insert(&mut self, key: &[u8], node_id: u128) -> Result<()> {
        let entry = self.index.entry(key.to_vec()).or_default();
        if self.unique && !entry.is_empty() {
            return Err(crate::embedded::error::Error::Constraint(format!(
                "Unique index {} already has a value",
                self.name,
            )));
        }
        entry.push(node_id);
        Ok(())
    }

    fn remove(&mut self, key: &[u8], node_id: u128) -> Result<()> {
        if let Some(entry) = self.index.get_mut(key) {
            entry.retain(|&id| id != node_id);
            if entry.is_empty() {
                self.index.remove(key);
            }
        }
        Ok(())
    }

    fn lookup(&self, key: &[u8]) -> Result<Vec<u128>> {
        Ok(self.index.get(key).cloned().unwrap_or_default())
    }

    fn range_scan(&self, start: &[u8], end: &[u8]) -> Result<Vec<u128>> {
        let mut results = Vec::new();
        for (key, ids) in &self.index {
            if key.as_slice() >= start && key.as_slice() < end {
                results.extend(ids.clone());
            }
        }
        Ok(results)
    }
}

pub struct IndexManager {
    indexes: HashMap<String, InMemorySecondaryIndex>,
}

impl IndexManager {
    pub fn new() -> Self {
        Self {
            indexes: HashMap::new(),
        }
    }

    pub fn create_index(&mut self, config: IndexConfig) -> Result<()> {
        let index = InMemorySecondaryIndex::new(config.name.clone(), config.unique);
        self.indexes.insert(config.name, index);
        Ok(())
    }

    pub fn get_index(&self, name: &str) -> Option<&InMemorySecondaryIndex> {
        self.indexes.get(name)
    }

    pub fn get_index_mut(&mut self, name: &str) -> Option<&mut InMemorySecondaryIndex> {
        self.indexes.get_mut(name)
    }

    pub fn index_node(&mut self, name: &str, key: &[u8], node_id: u128) -> Result<()> {
        if let Some(index) = self.get_index_mut(name) {
            index.insert(key, node_id)
        } else {
            Err(crate::embedded::error::Error::NotFound(format!(
                "Index {} not found",
                name
            )))
        }
    }

    pub fn lookup(&self, name: &str, key: &[u8]) -> Result<Vec<u128>> {
        if let Some(index) = self.get_index(name) {
            index.lookup(key)
        } else {
            Err(crate::embedded::error::Error::NotFound(format!(
                "Index {} not found",
                name
            )))
        }
    }

    pub fn remove_from_index(&mut self, name: &str, key: &[u8], node_id: u128) -> Result<()> {
        if let Some(index) = self.get_index_mut(name) {
            index.remove(key, node_id)
        } else {
            Err(crate::embedded::error::Error::NotFound(format!(
                "Index {} not found",
                name
            )))
        }
    }
}

impl Default for IndexManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_and_lookup_index() {
        let mut manager = IndexManager::new();
        manager
            .create_index(IndexConfig {
                name: "label".to_string(),
                unique: false,
            })
            .unwrap();

        manager.index_node("label", b"User", 1).unwrap();
        manager.index_node("label", b"User", 2).unwrap();
        manager.index_node("label", b"Product", 3).unwrap();

        let users = manager.lookup("label", b"User").unwrap();
        assert_eq!(users.len(), 2);
        assert!(users.contains(&1));
        assert!(users.contains(&2));
    }

    #[test]
    fn test_unique_index_constraint() {
        let mut manager = IndexManager::new();
        manager
            .create_index(IndexConfig {
                name: "email".to_string(),
                unique: true,
            })
            .unwrap();

        manager
            .index_node("email", b"alice@example.com", 1)
            .unwrap();

        let result = manager.index_node("email", b"alice@example.com", 2);
        assert!(result.is_err());
    }

    #[test]
    fn test_range_scan() {
        let mut manager = IndexManager::new();
        manager
            .create_index(IndexConfig {
                name: "age".to_string(),
                unique: false,
            })
            .unwrap();

        manager.index_node("age", b"010", 1).unwrap();
        manager.index_node("age", b"025", 2).unwrap();
        manager.index_node("age", b"030", 3).unwrap();
        manager.index_node("age", b"045", 4).unwrap();

        let results = manager.lookup("age", b"010").unwrap();
        assert_eq!(results.len(), 1);
        assert!(results.contains(&1));
    }
}
