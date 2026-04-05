use crate::embedded::storage::{InMemoryStorage, StorageBackend};
use crate::embedded::transaction::{Edge, Node};
use std::sync::Arc;
use std::thread;

pub fn test_concurrent_reads() {
    let storage = Arc::new(InMemoryStorage::new());

    storage
        .put_node(Node {
            id: 1,
            label: "Test".into(),
        })
        .unwrap();

    let storage_clone = storage.clone();
    let handle1 = thread::spawn(move || {
        for _ in 0..100 {
            let _ = storage_clone.get_node(1);
        }
    });

    let storage_clone = storage.clone();
    let handle2 = thread::spawn(move || {
        for _ in 0..100 {
            let _ = storage_clone.get_node(1);
        }
    });

    handle1.join().unwrap();
    handle2.join().unwrap();
}

pub fn test_concurrent_writes() {
    let storage = Arc::new(InMemoryStorage::new());

    let storage_clone = storage.clone();
    let handle1 = thread::spawn(move || {
        for i in 0..100 {
            let _ = storage_clone.put_node(Node {
                id: i,
                label: format!("Node{}", i),
            });
        }
    });

    let storage_clone = storage.clone();
    let handle2 = thread::spawn(move || {
        for i in 100..200 {
            let _ = storage_clone.put_node(Node {
                id: i,
                label: format!("Node{}", i),
            });
        }
    });

    handle1.join().unwrap();
    handle2.join().unwrap();

    let nodes = storage.scan_nodes().unwrap();
    assert_eq!(nodes.len(), 200);
}

pub fn test_concurrent_read_write() {
    let storage = Arc::new(InMemoryStorage::new());

    storage
        .put_node(Node {
            id: 1,
            label: "Initial".into(),
        })
        .unwrap();

    let storage_read = storage.clone();
    let reader = thread::spawn(move || {
        for _ in 0..100 {
            let _ = storage_read.get_node(1);
        }
    });

    let storage_write = storage.clone();
    let writer = thread::spawn(move || {
        for i in 0..100 {
            let _ = storage_write.put_node(Node {
                id: i,
                label: format!("Node{}", i),
            });
        }
    });

    reader.join().unwrap();
    writer.join().unwrap();
}

pub fn test_concurrent_edge_writes() {
    let storage = Arc::new(InMemoryStorage::new());

    storage
        .put_node(Node {
            id: 1,
            label: "A".into(),
        })
        .unwrap();
    storage
        .put_node(Node {
            id: 2,
            label: "B".into(),
        })
        .unwrap();

    let storage_clone = storage.clone();
    let handle = thread::spawn(move || {
        for i in 0..100 {
            let _ = storage_clone.put_edge(Edge {
                id: i,
                label: "EDGE".into(),
                from: 1,
                to: 2,
            });
        }
    });

    handle.join().unwrap();

    let edges = storage.scan_edges().unwrap();
    assert_eq!(edges.len(), 100);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_thread_safe_concurrent_reads() {
        test_concurrent_reads();
    }

    #[test]
    fn test_thread_safe_concurrent_writes() {
        test_concurrent_writes();
    }

    #[test]
    fn test_thread_safe_concurrent_read_write() {
        test_concurrent_read_write();
    }

    #[test]
    fn test_thread_safe_concurrent_edge_writes() {
        test_concurrent_edge_writes();
    }
}
