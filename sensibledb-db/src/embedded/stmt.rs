use crate::embedded::error::Result;

/// Value types supported in statements
#[derive(Debug, Clone, PartialEq)]
pub enum Value {
    Null,
    Integer(i64),
    Float(f64),
    Text(String),
    Blob(Vec<u8>),
    Boolean(bool),
}

pub struct Statement {
    #[allow(dead_code)]
    query: String,
}

impl Statement {
    pub fn prepare(_query: &str) -> Result<Self> {
        Ok(Self {
            query: _query.to_string(),
        })
    }

    pub fn bind(&mut self, _name: &str, _value: Value) -> Result<()> {
        Ok(())
    }

    pub fn bind_int(&mut self, _pos: usize, _value: i64) -> Result<()> {
        Ok(())
    }

    pub fn bind_text(&mut self, _pos: usize, _value: &str) -> Result<()> {
        Ok(())
    }

    pub fn bind_float(&mut self, _pos: usize, _value: f64) -> Result<()> {
        Ok(())
    }

    pub fn clear_bindings(&mut self) {}

    pub fn execute(&self) -> Result<QueryResult> {
        Ok(QueryResult {
            columns: vec![],
            rows: vec![],
            changes: 0,
        })
    }

    pub fn reset(&mut self) {}

    pub fn finalize(self) {}
}

pub struct QueryResult {
    pub columns: Vec<String>,
    pub rows: Vec<Vec<Value>>,
    pub changes: u64,
}
