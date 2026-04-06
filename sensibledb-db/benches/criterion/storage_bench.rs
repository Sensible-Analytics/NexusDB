use bumpalo::Bump;
use bumpalo::Bump;
use criterion::{black_box, criterion_group, criterion_main, Criterion};
use sensibledb_db::sensibledb_engine::storage_core::{
    SensibleGraphStorage, StorageConfig, VersionInfo,
};
use sensibledb_db::sensibledb_engine::traversal_core::config::Config;
use tempfile::TempDir;
use uuid::Uuid;

fn setup_test_storage() -> (SensibleGraphStorage, TempDir) {
    let temp_dir = TempDir::new().unwrap();
    let path = temp_dir.path().to_str().unwrap();

    let mut config = Config::default();
    config.db_max_size_gb = Some(1);

    let version_info = VersionInfo::default();
    let storage = SensibleGraphStorage::new(path, config, version_info).unwrap();
    (storage, temp_dir)
}

fn criterion_benchmark(c: &mut Criterion) {
    let mut group = c.benchmark_group("Storage operations");

    group.bench_function("create_node", |b| {
        b.iter(|| {
            let (storage, _temp_dir) = setup_test_storage();
            let mut wtxn = storage.graph_env.write_txn().unwrap();
            let arena = Bump::new();
            let node_id = Uuid::new_v4().as_u128();
            let label = arena.alloc_str("test_node");
            let node = sensibledb_db::utils::items::Node {
                id: node_id,
                label,
                version: 1,
                properties: None,
            };
            storage
                .nodes_db
                .put(&mut wtxn, &node.id, &node.to_bincode_bytes().unwrap())
                .unwrap();
            wtxn.commit().unwrap();
            black_box((storage, node_id));
        })
    });

    group.bench_function("get_node", |b| {
        b.iter(|| {
            let (storage, temp_dir) = setup_test_storage();
            let mut wtxn = storage.graph_env.write_txn().unwrap();
            let arena = Bump::new();
            let node_id = Uuid::new_v4().as_u128();
            let label = arena.alloc_str("test_node");
            let node = sensibledb_db::utils::items::Node {
                id: node_id,
                label,
                version: 1,
                properties: None,
            };
            storage
                .nodes_db
                .put(&mut wtxn, &node.id, &node.to_bincode_bytes().unwrap())
                .unwrap();
            wtxn.commit().unwrap();

            let rtxn = storage.graph_env.read_txn().unwrap();
            let result = storage.nodes_db.get(&rtxn, &node_id).unwrap();
            black_box(result);
        })
    });

    group.bench_function("create_edge", |b| {
        b.iter(|| {
            let (storage, _temp_dir) = setup_test_storage();
            let mut wtxn = storage.graph_env.write_txn().unwrap();
            let arena = Bump::new();

            let source_id = Uuid::new_v4().as_u128();
            let dest_id = Uuid::new_v4().as_u128();
            let source_label = arena.alloc_str("source");
            let dest_label = arena.alloc_str("destination");

            let source_node = sensibledb_db::utils::items::Node {
                id: source_id,
                label: source_label,
                version: 1,
                properties: None,
            };
            let dest_node = sensibledb_db::utils::items::Node {
                id: dest_id,
                label: dest_label,
                version: 1,
                properties: None,
            };

            storage
                .nodes_db
                .put(
                    &mut wtxn,
                    &source_node.id,
                    &source_node.to_bincode_bytes().unwrap(),
                )
                .unwrap();
            storage
                .nodes_db
                .put(
                    &mut wtxn,
                    &dest_node.id,
                    &dest_node.to_bincode_bytes().unwrap(),
                )
                .unwrap();

            let edge_id = Uuid::new_v4().as_u128();
            let edge_label = arena.alloc_str("test_edge");
            let edge = sensibledb_db::utils::items::Edge {
                id: edge_id,
                from_node: source_id,
                to_node: dest_id,
                label: edge_label,
                version: 1,
                properties: None,
            };

            storage
                .edges_db
                .put(&mut wtxn, &edge.id, &edge.to_bincode_bytes().unwrap())
                .unwrap();
            wtxn.commit().unwrap();
            black_box((storage, edge_id));
        })
    });

    group.finish();
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
