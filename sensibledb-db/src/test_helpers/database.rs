use std::path::PathBuf;
use tempfile::TempDir;

pub struct TestDb {
    pub path: PathBuf,
    _temp_dir: Option<TempDir>,
}

impl TestDb {
    pub fn new() -> Self {
        let temp_dir = tempfile::tempdir().expect("Failed to create temp dir");
        let path = temp_dir.path().join("test.nxdb");
        Self {
            path,
            _temp_dir: Some(temp_dir),
        }
    }

    pub fn in_memory() -> Self {
        let temp_dir = tempfile::tempdir().expect("Failed to create temp dir");
        let path = temp_dir.path().join("memory.nxdb");
        Self {
            path,
            _temp_dir: Some(temp_dir),
        }
    }

    pub fn path(&self) -> &PathBuf {
        &self.path
    }
}

impl Default for TestDb {
    fn default() -> Self {
        Self::new()
    }
}
