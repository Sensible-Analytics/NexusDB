use crate::embedded::database::Database;
use crate::embedded::error::Result;

pub struct TestDatabase {
    db: Database,
}

impl TestDatabase {
    pub fn new() -> Result<Self> {
        let db = Database::open_memory()?;
        Ok(Self { db })
    }

    pub fn open<P: AsRef<std::path::Path>>(path: P) -> Result<Self> {
        let db = Database::open(path)?;
        Ok(Self { db })
    }

    pub fn inner(&self) -> &Database {
        &self.db
    }

    pub fn begin_transaction(&self) -> Result<TestTransaction<'_>> {
        Ok(TestTransaction { _db: self })
    }
}

pub struct TestTransaction<'a> {
    _db: &'a TestDatabase,
}

impl Drop for TestTransaction<'_> {
    fn drop(&mut self) {}
}
