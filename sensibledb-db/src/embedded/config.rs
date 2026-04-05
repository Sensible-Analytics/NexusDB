#[derive(Debug, Clone)]
pub struct Config {
    pub max_size_gb: u64,
    pub read_only: bool,
    pub create_if_missing: bool,
    pub enable_vectors: bool,
    pub hnsw_m: u32,
    pub hnsw_ef_construction: u32,
    pub hnsw_ef_search: u32,
    pub enable_bm25: bool,
    pub query_timeout_ms: u64,
    pub cache_size_mb: i64,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            max_size_gb: 10,
            read_only: false,
            create_if_missing: true,
            enable_vectors: true,
            hnsw_m: 16,
            hnsw_ef_construction: 128,
            hnsw_ef_search: 100,
            enable_bm25: true,
            query_timeout_ms: 30_000,
            cache_size_mb: 64,
        }
    }
}

impl Config {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_max_size(mut self, size_gb: u64) -> Self {
        self.max_size_gb = size_gb;
        self
    }

    pub fn with_read_only(mut self, read_only: bool) -> Self {
        self.read_only = read_only;
        self
    }

    pub fn with_vectors(mut self, enable: bool) -> Self {
        self.enable_vectors = enable;
        self
    }

    pub fn with_bm25(mut self, enable: bool) -> Self {
        self.enable_bm25 = enable;
        self
    }
}
