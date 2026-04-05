pub mod sensibledb_engine;
pub mod sensibledb_gateway;
#[cfg(feature = "compiler")]
pub mod sensibledbc;
pub mod protocol;
pub mod utils;

#[cfg(feature = "embedded")]
pub mod embedded;

#[cfg(feature = "embedded")]
pub mod test_helpers;

use mimalloc::MiMalloc;

#[global_allocator]
static GLOBAL: MiMalloc = MiMalloc;
