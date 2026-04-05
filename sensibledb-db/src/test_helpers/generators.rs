use crate::embedded::transaction::{Edge, Node};

pub fn test_node(id: u128) -> Node {
    Node {
        id,
        label: format!("TestNode_{}", id),
    }
}

pub fn test_edge(id: u128, from: u128, to: u128) -> Edge {
    Edge {
        id,
        label: format!("TEST_EDGE_{}", id),
        from,
        to,
    }
}

pub fn node_with_label(id: u128, label: &str) -> Node {
    Node {
        id,
        label: label.to_string(),
    }
}
