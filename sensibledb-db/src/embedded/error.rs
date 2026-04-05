use thiserror::Error;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Database not found: {0}")]
    NotFound(String),

    #[error("Database is locked")]
    Locked,

    #[error("Constraint violated: {0}")]
    Constraint(String),

    #[error("Database corrupted: {0}")]
    Corruption(String),

    #[error("Database is read-only")]
    ReadOnly,

    #[error("Out of memory")]
    OutOfMemory,

    #[error("Invalid parameter: {0}")]
    InvalidParameter(String),

    #[error("Transaction error: {0}")]
    Transaction(String),

    #[error("Storage error: {0}")]
    Storage(String),

    #[error("IO error: {0}")]
    Io(String),

    #[error("Node not found: {0}")]
    NodeNotFound(String),

    #[error("Edge not found: {0}")]
    EdgeNotFound(String),

    #[error("Database error: {0}")]
    Generic(String),
}

impl Error {
    pub fn is_not_found(&self) -> bool {
        matches!(
            self,
            Error::NotFound(_) | Error::NodeNotFound(_) | Error::EdgeNotFound(_)
        )
    }
}
