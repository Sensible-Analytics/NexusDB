#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_test_db_new() {
        let db = database::TestDb::new();
        assert!(db.path.exists() || !db.path.to_string_lossy().is_empty());
    }

    #[test]
    fn test_test_db_in_memory() {
        let db = database::TestDb::in_memory();
        assert!(!db.path.to_string_lossy().is_empty());
    }

    #[test]
    fn test_database_fixture() {
        let _db = fixtures::TestDatabase::new().expect("Failed to create test database");
    }

    #[test]
    fn test_transaction_fixture() {
        let db = fixtures::TestDatabase::new().expect("Failed to create test database");
        let _tx = db.begin_transaction().expect("Failed to begin transaction");
    }
}

pub mod database;
pub mod fixtures;
pub mod generators;
