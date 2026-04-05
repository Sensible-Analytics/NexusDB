use crate::embedded::error::Result;
use crate::embedded::storage::StorageBackend;
use crate::embedded::transaction::{Edge, Node};
use crate::embedded::traversal::{GraphTraversal, TraversalOptions, TraversalResult};
use std::collections::{HashSet, VecDeque};

pub struct InMemoryGraphTraversal<S: StorageBackend> {
    storage: S,
}

impl<S: StorageBackend> InMemoryGraphTraversal<S> {
    pub fn new(storage: S) -> Self {
        Self { storage }
    }
}

impl<S: StorageBackend> GraphTraversal for InMemoryGraphTraversal<S> {
    fn traverse_bfs(&self, start_id: u128, options: TraversalOptions) -> Result<TraversalResult> {
        let mut visited = HashSet::new();
        let mut queue = VecDeque::new();
        let mut all_nodes = Vec::new();
        let mut all_edges = Vec::new();
        let mut paths = Vec::new();

        queue.push_back((start_id, vec![start_id]));
        visited.insert(start_id);

        while let Some((current_id, path)) = queue.pop_front() {
            if path.len() > options.max_depth {
                continue;
            }

            if let Some(node) = self.storage.get_node(current_id)? {
                all_nodes.push(node);
                if options.include_edges {
                    if let Ok(edges) = self.get_out_edges(current_id) {
                        all_edges.extend(edges);
                    }
                }
            }

            if let Some(limit) = options.limit {
                if all_nodes.len() >= limit {
                    break;
                }
            }

            if let Ok(neighbors) = self.get_out_neighbors(current_id) {
                for neighbor in neighbors {
                    if !visited.contains(&neighbor.id) {
                        visited.insert(neighbor.id);
                        let mut new_path = path.clone();
                        new_path.push(neighbor.id);
                        queue.push_back((neighbor.id, new_path));
                    }
                }
            }

            paths.push(path);
        }

        Ok(TraversalResult {
            nodes: all_nodes,
            edges: all_edges,
            paths,
        })
    }

    fn traverse_dfs(&self, start_id: u128, options: TraversalOptions) -> Result<TraversalResult> {
        let mut visited = HashSet::new();
        let mut all_nodes = Vec::new();
        let mut all_edges = Vec::new();
        let mut paths = Vec::new();

        self.dfs_recursive(
            start_id,
            &mut visited,
            options.max_depth,
            &mut all_nodes,
            &mut all_edges,
            &mut paths,
            &options,
        )?;

        Ok(TraversalResult {
            nodes: all_nodes,
            edges: all_edges,
            paths,
        })
    }

    fn get_out_neighbors(&self, node_id: u128) -> Result<Vec<Node>> {
        let edges = self.storage.scan_edges()?;
        let mut neighbors = Vec::new();
        for e in edges.into_iter().filter(|e| e.from == node_id) {
            if let Some(node) = self.storage.get_node(e.to)? {
                neighbors.push(node);
            }
        }
        Ok(neighbors)
    }

    fn get_in_neighbors(&self, node_id: u128) -> Result<Vec<Node>> {
        let edges = self.storage.scan_edges()?;
        let mut neighbors = Vec::new();
        for e in edges.into_iter().filter(|e| e.to == node_id) {
            if let Some(node) = self.storage.get_node(e.from)? {
                neighbors.push(node);
            }
        }
        Ok(neighbors)
    }

    fn get_out_edges(&self, node_id: u128) -> Result<Vec<Edge>> {
        let edges = self.storage.scan_edges()?;
        Ok(edges.into_iter().filter(|e| e.from == node_id).collect())
    }

    fn get_in_edges(&self, node_id: u128) -> Result<Vec<Edge>> {
        let edges = self.storage.scan_edges()?;
        Ok(edges.into_iter().filter(|e| e.to == node_id).collect())
    }

    fn find_paths(&self, from_id: u128, to_id: u128, max_length: usize) -> Result<Vec<Vec<u128>>> {
        let mut result = Vec::new();
        let mut visited = HashSet::new();
        let mut path = vec![from_id];

        self.find_paths_recursive(
            from_id,
            to_id,
            max_length,
            &mut visited,
            &mut path,
            &mut result,
        );

        Ok(result)
    }
}

impl<S: StorageBackend> InMemoryGraphTraversal<S> {
    #[allow(clippy::too_many_arguments)]
    fn dfs_recursive(
        &self,
        node_id: u128,
        visited: &mut HashSet<u128>,
        max_depth: usize,
        all_nodes: &mut Vec<Node>,
        all_edges: &mut Vec<Edge>,
        paths: &mut Vec<Vec<u128>>,
        options: &TraversalOptions,
    ) -> Result<()> {
        if visited.contains(&node_id) || max_depth == 0 {
            return Ok(());
        }

        visited.insert(node_id);
        paths.push(vec![node_id]);

        if let Some(node) = self.storage.get_node(node_id)? {
            all_nodes.push(node);

            if let Some(limit) = options.limit {
                if all_nodes.len() >= limit {
                    return Ok(());
                }
            }

            if options.include_edges {
                if let Ok(edges) = self.get_out_edges(node_id) {
                    all_edges.extend(edges);
                }
            }
        }

        let neighbors = self.get_out_neighbors(node_id)?;
        for neighbor in neighbors {
            self.dfs_recursive(
                neighbor.id,
                visited,
                max_depth - 1,
                all_nodes,
                all_edges,
                paths,
                options,
            )?;
        }

        Ok(())
    }

    fn find_paths_recursive(
        &self,
        current: u128,
        target: u128,
        max_length: usize,
        visited: &mut HashSet<u128>,
        path: &mut Vec<u128>,
        result: &mut Vec<Vec<u128>>,
    ) {
        if current == target {
            result.push(path.clone());
            return;
        }

        if max_length == 0 || visited.contains(&current) {
            return;
        }

        visited.insert(current);

        if let Ok(neighbors) = self.get_out_neighbors(current) {
            for neighbor in neighbors {
                path.push(neighbor.id);
                self.find_paths_recursive(
                    neighbor.id,
                    target,
                    max_length - 1,
                    visited,
                    path,
                    result,
                );
                path.pop();
            }
        }

        visited.remove(&current);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::embedded::storage::InMemoryStorage;

    fn setup_test_storage() -> InMemoryStorage {
        let storage = InMemoryStorage::new();

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
        storage
            .put_node(Node {
                id: 3,
                label: "C".into(),
            })
            .unwrap();
        storage
            .put_node(Node {
                id: 4,
                label: "D".into(),
            })
            .unwrap();

        storage
            .put_edge(Edge {
                id: 10,
                label: "AB".into(),
                from: 1,
                to: 2,
            })
            .unwrap();
        storage
            .put_edge(Edge {
                id: 20,
                label: "BC".into(),
                from: 2,
                to: 3,
            })
            .unwrap();
        storage
            .put_edge(Edge {
                id: 30,
                label: "CD".into(),
                from: 3,
                to: 4,
            })
            .unwrap();
        storage
            .put_edge(Edge {
                id: 40,
                label: "AC".into(),
                from: 1,
                to: 3,
            })
            .unwrap();

        storage
    }

    #[test]
    fn test_bfs_traversal() {
        let storage = setup_test_storage();
        let traversal = InMemoryGraphTraversal::new(storage);

        let result = traversal
            .traverse_bfs(1, TraversalOptions::default())
            .unwrap();

        assert_eq!(result.nodes.len(), 4);
        assert_eq!(result.edges.len(), 4);
    }

    #[test]
    fn test_dfs_traversal() {
        let storage = setup_test_storage();
        let traversal = InMemoryGraphTraversal::new(storage);

        let result = traversal
            .traverse_dfs(1, TraversalOptions::default())
            .unwrap();

        assert_eq!(result.nodes.len(), 4);
    }

    #[test]
    fn test_get_out_edges() {
        let storage = setup_test_storage();
        let traversal = InMemoryGraphTraversal::new(storage);

        let edges = traversal.get_out_edges(1).unwrap();

        assert_eq!(edges.len(), 2);
    }

    #[test]
    fn test_find_paths() {
        let storage = setup_test_storage();
        let traversal = InMemoryGraphTraversal::new(storage);

        let paths = traversal.find_paths(1, 3, 10).unwrap();

        assert!(!paths.is_empty());
    }
}
