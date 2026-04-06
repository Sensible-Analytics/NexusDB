use crate::protocol::value::Value;
use crate::sensibledb_engine::storage_core::{SensibleGraphStorage, VersionInfo};
use crate::sensibledb_engine::traversal_core::config::Config;
use crate::utils::items::{Edge, Node};
use crate::utils::properties::ImmutablePropertiesMap;
use bumpalo::Bump;
use proptest::prelude::*;
use tempfile::TempDir;

fn arb_node_label() -> impl Strategy<Value = String> {
    prop::string::string_regex("[a-zA-Z0-9_]{1,50}").unwrap()
}

fn arb_node_properties() -> impl Strategy<Value = Option<Vec<(String, String)>>> {
    prop::option::of(prop::collection::vec(
        (
            arb_node_label(),
            prop::string::string_regex("[a-zA-Z0-9 ]{0,100}").unwrap(),
        ),
        0..5,
    ))
}

fn arb_node() -> impl Strategy<Value = Node<'static>> {
    (
        any::<u128>(),
        arb_node_label(),
        arb_node_properties(),
        any::<u8>(),
    )
        .prop_map(
            |(id, label, properties, version): (
                u128,
                String,
                Option<Vec<(String, String)>>,
                u8,
            )| {
                let label_static = Box::leak(label.into_boxed_str());
                let arena = Box::leak(Box::new(Bump::new()));
                Node {
                    id,
                    label: label_static,
                    version,
                    properties: properties.map(|props| {
                        let props_vec: Vec<(&'static str, Value)> = props
                            .into_iter()
                            .map(|(k, v): (String, String)| {
                                let k_static: &'static str = Box::leak(k.into_boxed_str());
                                (k_static, Value::String(v))
                            })
                            .collect();
                        ImmutablePropertiesMap::new(props_vec.len(), props_vec.into_iter(), arena)
                    }),
                }
            },
        )
}

fn arb_edge() -> impl Strategy<Value = Edge<'static>> {
    (
        any::<u128>(),
        any::<u128>(),
        arb_node_label(),
        arb_node_properties(),
        any::<u8>(),
    )
        .prop_map(
            |(from_id, to_id, label, properties, version): (
                u128,
                u128,
                String,
                Option<Vec<(String, String)>>,
                u8,
            )| {
                // Create a static string for the label (leaks memory but OK for tests)
                let label_static = Box::leak(label.into_boxed_str());
                // Create a static Bump allocator for the properties (leaks memory but OK for tests)
                let arena = Box::leak(Box::new(Bump::new()));
                Edge {
                    id: 0,
                    from_node: from_id,
                    to_node: to_id,
                    label: label_static,
                    version,
                    properties: properties.map(|props| {
                        let props_vec: Vec<(&'static str, Value)> = props
                            .into_iter()
                            .map(|(k, v): (String, String)| {
                                let k_static: &'static str = Box::leak(k.into_boxed_str());
                                (k_static, Value::String(v))
                            })
                            .collect();
                        ImmutablePropertiesMap::new(props_vec.len(), props_vec.into_iter(), arena)
                    }),
                }
            },
        )
}

fn create_test_storage() -> (SensibleGraphStorage, TempDir) {
    let temp_dir = TempDir::new().unwrap();
    let path = temp_dir.path().to_str().unwrap();

    let mut config = Config::default();
    config.db_max_size_gb = Some(1);

    let version_info = VersionInfo::default();
    let storage = SensibleGraphStorage::new(path, config, version_info).unwrap();
    (storage, temp_dir)
}

proptest! {
    #![proptest_config(ProptestConfig::with_cases(100))]

    #[test]
    fn test_node_storage_roundtrip(node in arb_node()) {
        let (storage, _temp_dir) = create_test_storage();
        let mut wtxn = storage.graph_env.write_txn().unwrap();

        storage
            .nodes_db
            .put(&mut wtxn, &node.id, &node.to_bincode_bytes().unwrap())
            .unwrap();
        wtxn.commit().unwrap();

        let rtxn = storage.graph_env.read_txn().unwrap();
        let retrieved_bytes = storage.nodes_db.get(&rtxn, &node.id).unwrap().unwrap();
        let arena = Bump::new();
        let retrieved_node = Node::from_bincode_bytes(node.id, retrieved_bytes, &arena).unwrap();

        prop_assert_eq!(node.id, retrieved_node.id);
        prop_assert_eq!(node.label, retrieved_node.label);
        prop_assert_eq!(node.version, retrieved_node.version);
        prop_assert_eq!(node.properties, retrieved_node.properties);
    }

    #[test]
    fn test_edge_storage_roundtrip(edge in arb_edge()) {
        let (storage, _temp_dir) = create_test_storage();
        let mut wtxn = storage.graph_env.write_txn().unwrap();

        storage
            .edges_db
            .put(&mut wtxn, &edge.id, &edge.to_bincode_bytes().unwrap())
            .unwrap();
        wtxn.commit().unwrap();

        let rtxn = storage.graph_env.read_txn().unwrap();
        let retrieved_bytes = storage.edges_db.get(&rtxn, &edge.id).unwrap().unwrap();
        let arena = Bump::new();
        let retrieved_edge = Edge::from_bincode_bytes(edge.id, retrieved_bytes, &arena).unwrap();

        prop_assert_eq!(edge.id, retrieved_edge.id);
        prop_assert_eq!(edge.from_node, retrieved_edge.from_node);
        prop_assert_eq!(edge.to_node, retrieved_edge.to_node);
        prop_assert_eq!(edge.version, retrieved_edge.version);
        prop_assert_eq!(edge.properties, retrieved_edge.properties);
    }

    #[test]
    fn test_multiple_nodes_storage(nodes in prop::collection::vec(arb_node(), 0..20)) {
        let (storage, _temp_dir) = create_test_storage();
        let mut wtxn = storage.graph_env.write_txn().unwrap();

        for node in &nodes {
            storage
                .nodes_db
                .put(&mut wtxn, &node.id, &node.to_bincode_bytes().unwrap())
                .unwrap();
        }
        wtxn.commit().unwrap();

        let rtxn = storage.graph_env.read_txn().unwrap();
        for original_node in &nodes {
            let retrieved_bytes = storage.nodes_db.get(&rtxn, &original_node.id).unwrap().unwrap();
            let arena = Bump::new();
            let retrieved_node = Node::from_bincode_bytes(original_node.id, retrieved_bytes, &arena).unwrap();

            prop_assert_eq!(original_node.id, retrieved_node.id);
            prop_assert_eq!(original_node.label, retrieved_node.label);
            prop_assert_eq!(original_node.version, retrieved_node.version);
            prop_assert_eq!(original_node.properties, retrieved_node.properties);
        }
    }
}
