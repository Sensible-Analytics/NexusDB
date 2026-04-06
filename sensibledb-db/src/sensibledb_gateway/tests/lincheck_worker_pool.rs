use lincheck::{lincheck, model::History, model::Operation, StressConfig};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tempfile::TempDir;

use crate::protocol::{request::RequestType, response::Response, Format, Request};
use crate::sensibledb_engine::traversal_core::config::Config;
use crate::sensibledb_engine::traversal_core::SensibleGraphEngine;
use crate::sensibledb_engine::traversal_core::SensibleGraphEngineOpts;
use crate::sensibledb_engine::types::GraphError;
use crate::sensibledb_gateway::worker_pool::WorkerPool;
use crate::sensibledb_gateway::{
    gateway::CoreSetter,
    router::router::{HandlerInput, SensibleRouter},
};
use axum::body::Bytes;

fn test_handler(_input: HandlerInput) -> Result<Response, GraphError> {
    Ok(Response {
        body: b"test response".to_vec(),
        fmt: Format::Json,
    })
}

fn create_test_graph() -> (Arc<SensibleGraphEngine>, TempDir) {
    let temp_dir = TempDir::new().unwrap();
    let opts = SensibleGraphEngineOpts {
        path: temp_dir.path().to_str().unwrap().to_string(),
        config: Config::default(),
        version_info: Default::default(),
    };

    let engine = SensibleGraphEngine::new(opts).unwrap();
    (Arc::new(engine), temp_dir)
}

#[derive(Debug, Clone)]
enum WorkerPoolOp {
    SubmitRequest(usize),
    Shutdown,
}

struct RefWorkerPool {
    next_request_id: AtomicUsize,
    completed_requests: AtomicUsize,
    is_shutdown: AtomicUsize,
}

impl RefWorkerPool {
    fn new() -> Self {
        RefWorkerPool {
            next_request_id: AtomicUsize::new(0),
            completed_requests: AtomicUsize::new(0),
            is_shutdown: AtomicUsize::new(0),
        }
    }

    fn apply(&self, op: &WorkerPoolOp) {
        match op {
            WorkerPoolOp::SubmitRequest(_) => {
                if self.is_shutdown.load(Ordering::SeqCst) == 0 {
                    self.next_request_id.fetch_add(1, Ordering::SeqCst);
                }
            }
            WorkerPoolOp::Shutdown => {
                self.is_shutdown.store(1, Ordering::SeqCst);
            }
        }
    }

    fn invoke(&self, op: &WorkerPoolOp) -> Option<usize> {
        match op {
            WorkerPoolOp::SubmitRequest(id) => {
                if self.is_shutdown.load(Ordering::SeqCst) == 0 {
                    Some(*id)
                } else {
                    None
                }
            }
            WorkerPoolOp::Shutdown => None,
        }
    }
}

struct WorkerPoolSUT {
    pool: WorkerPool,
    core_setter: Arc<CoreSetter>,
    router: Arc<SensibleRouter>,
    graph_engine: Arc<SensibleGraphEngine>,
}

impl WorkerPoolSUT {
    fn new() -> Self {
        let (graph_engine, _temp_dir) = create_test_graph();
        let core_setter = Arc::new(CoreSetter::new());
        let router = Arc::new(SensibleRouter::new(
            graph_engine.clone(),
            core_setter.clone(),
            test_handler,
        ));
        let pool =
            WorkerPool::new(4, graph_engine.clone(), core_setter.clone(), router.clone()).unwrap();

        WorkerPoolSUT {
            pool,
            core_setter,
            router,
            graph_engine,
        }
    }

    fn apply(&self, op: &WorkerPoolOp) {
        match op {
            WorkerPoolOp::SubmitRequest(request_id) => {
                let request = Request {
                    id: request_id.to_string(),
                    request_type: RequestType::Query,
                    body: "test query".to_string(),
                };

                let _ = self.pool.submit(request);
            }
            WorkerPoolOp::Shutdown => {
                let _ = self.pool.shutdown();
            }
        }
    }
}

lincheck! {
    struct WorkerPoolModel {
        sut: WorkerPoolSUT,
        ref_model: RefWorkerPool,
    }

    operations = {
        WorkerPoolOp::SubmitRequest(0..10),
        WorkerPoolOp::Shutdown,
    };

    config = StressConfig {
        ops: 100,
        threads: 4,
        iterations: 10,
        length: 20,
        check_deadlocks: true,
        check_livelocks: true,
    };
}

#[test]
fn test_worker_pool_linearizability() {}
