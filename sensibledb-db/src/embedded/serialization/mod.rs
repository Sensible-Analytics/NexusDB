use crate::embedded::error::{Error, Result};
use crate::embedded::transaction::{Edge, Node};
use serde::{de::DeserializeOwned, Serialize};

pub fn to_json<T: Serialize>(value: &T) -> Result<String> {
    serde_json::to_string(value)
        .map_err(|e| Error::Generic(format!("JSON serialization error: {}", e)))
}

pub fn from_json<T: DeserializeOwned>(json: &str) -> Result<T> {
    serde_json::from_str(json)
        .map_err(|e| Error::Generic(format!("JSON deserialization error: {}", e)))
}

pub fn to_bincode<T: Serialize>(value: &T) -> Result<Vec<u8>> {
    bincode::serialize(value)
        .map_err(|e| Error::Generic(format!("Bincode serialization error: {}", e)))
}

pub fn from_bincode<T: DeserializeOwned>(bytes: &[u8]) -> Result<T> {
    bincode::deserialize(bytes)
        .map_err(|e| Error::Generic(format!("Bincode deserialization error: {}", e)))
}

pub fn node_to_json(node: &Node) -> Result<String> {
    to_json(node)
}

pub fn node_from_json(json: &str) -> Result<Node> {
    from_json(json)
}

pub fn edge_to_json(edge: &Edge) -> Result<String> {
    to_json(edge)
}

pub fn edge_from_json(json: &str) -> Result<Edge> {
    from_json(json)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_node_json_roundtrip() {
        let node = Node {
            id: 123,
            label: "TestNode".to_string(),
        };

        let json = node_to_json(&node).unwrap();
        let parsed: Node = node_from_json(&json).unwrap();

        assert_eq!(node.id, parsed.id);
        assert_eq!(node.label, parsed.label);
    }

    #[test]
    fn test_edge_json_roundtrip() {
        let edge = Edge {
            id: 456,
            label: "KNOWS".to_string(),
            from: 100,
            to: 200,
        };

        let json = edge_to_json(&edge).unwrap();
        let parsed: Edge = edge_from_json(&json).unwrap();

        assert_eq!(edge.id, parsed.id);
        assert_eq!(edge.label, parsed.label);
        assert_eq!(edge.from, parsed.from);
        assert_eq!(edge.to, parsed.to);
    }

    #[test]
    fn test_node_bincode_roundtrip() {
        let node = Node {
            id: 789,
            label: "BinaryNode".to_string(),
        };

        let bytes = to_bincode(&node).unwrap();
        let parsed: Node = from_bincode(&bytes).unwrap();

        assert_eq!(node.id, parsed.id);
        assert_eq!(node.label, parsed.label);
    }
}
