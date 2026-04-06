# SensibleDB Testing Strategy

This document explains the multi-tier testing infrastructure implemented in SensibleDB to ensure correctness, performance, and reliability of the embedded graph-vector database.

## Testing Tiers

SensibleDB employs a six-tier testing approach, inspired by production embedded databases like DuckDB, Redb, and SurrealDB. Each tier serves a specific purpose and has different execution characteristics.

### Tier 1: Unit Tests (Fast - milliseconds)
Purpose: Test pure functions, data structures, and isolated logic
Location: */tests/ or */src/*/tests/ 
Execution: Every commit, highly parallel
Patterns:
  - In-memory storage only (no file I/O)
  - Pure functions and data structure tests
  - Deterministic, single-threaded
  - Property-based testing with proptest where applicable
Examples: 
  - sensibledb-db/src/sensibledb_engine/tests/vector_tests.rs - HVector operations
  - sensibledb-db/src/protocol/custom_serde/property_based_tests.rs - Serialization properties
  - sensibledb-db/src/sensibledb_engine/storage_core/property_based_tests.rs - Storage round-trip properties

### Tier 2: Integration Tests (Medium - seconds)
Purpose: Test component interactions, file I/O, transactions
Location: */tests/ or dedicated test modules
Execution: Every PR, parallelizable with resource awareness
Patterns:
  - Temp directory-backed storage (full file semantics)
  - Single-threaded or controlled concurrency
  - Test actual LMDB/SQLite APIs (not just modeled behavior)
  - Transaction isolation and basic concurrency scenarios
Examples:
  - sensibledb-db/src/sensibledb_engine/storage_core/storage_migration_tests.rs - Storage migration logic
  - sensibledb-db/src/sensibledb_gateway/tests/gateway_tests.rs - Gateway/unit tests
  - sensibledb-db/src/sensibledb-cli/src/tests/ - CLI command tests

### Tier 3: Concurrency & Model Testing (Slow - seconds to minutes)
Purpose: Verify thread safety, lock ordering, and correctness under concurrency
Location: */tests/concurrency/ or specialized test modules
Execution: Every PR + dedicated Loom/CI jobs
Patterns:
  - Loom testing: For exhaustive exploration of thread interleavings in critical sections
  - Lincheck testing: For linearizability verification of concurrent data structures
  - Real LMDB concurrency: Limited threaded tests with actual LMDB operations (serialized)
Examples:
  - sensibledb-db/src/sensibledb_gateway/tests/gateway_loom_tests.rs - Gateway worker pool concurrency
  - sensibledb-db/src/sensibledb_engine/tests/concurrency_tests/hnsw_loom_tests.rs - HNSW concurrency
  - sensibledb-db/src/sensibledb_gateway/tests/lincheck_worker_pool.rs - Worker pool linearizability

### Tier 4: Stress & Chaos Testing (Slow - minutes)
Purpose: Test system behavior under load, resource pressure, and failure scenarios
Location: */tests/stress/ or */tests/chaos/
Execution: Nightly runs + release candidates
Patterns:
  - High-volume data operations
  - Long-running tests to detect leaks
  - Resource exhaustion (memory, disk space)
  - Process/kill mid-operation to test recovery
Examples:
  - sensibledb-db/src/sensibledb_engine/tests/concurrency_tests/integration_stress_tests.rs - Integrated stress tests
  - Existing benchmark files in sensibledb-db/benches/ adapted for stress testing

### Tier 5: Compatibility & Configuration Testing (Slow)
Purpose: Verify behavior across configurations and versions
Location: */tests/config/ or */tests/compat/
Execution: Nightly + scheduled
Patterns:
  - Different backend configurations (LMDB vs in-memory)
  - Storage format compatibility (backward/forward)
  - Feature flag combinations
Examples: 
  - Tests run with different Cargo features (embedded, dev, production, etc.)
  - Configuration-based testing approach similar to DuckDB's test/configs/*.json

### Tier 6: Performance Benchmarking (Variable)
Purpose: Track performance regressions and optimizations
Location: benches/ directory (standard Rust convention)
Execution: On demand + nightly performance tracking
Patterns:
  - Criterion benchmarking: Statistical benchmarking with CI integration
  - Microbenchmarks: Focused performance tests on critical paths
  - Regression tracking: Compare against baselines in CI
Examples:
  - sensibledb-db/benches/criterion/hvector_bench.rs - HVector operations benchmark
  - sensibledb-db/benches/criterion/storage_bench.rs - Storage operations benchmark
  - Existing benches: sensibledb-db/benches/hnsw_benches.rs, bm25_benches.rs

## Key Testing Tools and Patterns

Property-Based Testing (proptest)
Used extensively to verify semantic properties through generative testing:
- Serialization round-trip: deserialize(serialize(x)) == x
- Invariant preservation (IDs, relationships, version numbers)
- Edge case discovery through automatic shrinking

Concurrency Verification
- Loom: Exhaustive thread interleaving analysis for lock-free data structures and critical sections
- Lincheck: Linearizability verification for concurrent data structures (worker pools, caches)
- Real-world concurrency: Limited threaded tests with actual LMDB access (properly serialized)

Test Isolation
- TempDir/tempfile: Automatic cleanup of test directories and files
- Feature flags: LMDB-backed tests gated behind lmdb feature
- Serialization: #[serial] and #[serial_test] attributes prevent interference on shared resources

Benchmarking
- Criterion: Statistical benchmarking with sophisticated analysis (outlier detection, confidence intervals)
- Microbenchmarks: Simple performance tests for quick feedback
- CI Integration: Benchmarks run in CI to detect performance regressions

## Running Different Test Types

Unit and Integration Tests
bash
# Run all tests (unit + integration)
cargo test

# Run tests with specific features
cargo test --features dev
cargo test --features production

# Run tests for a specific crate
cargo test -p sensibledb-db
cargo test -p sensibledb-cli

Loom Concurrency Tests
bash
# Enable loom for model checking
RUSTFLAGS="--cfg loom" cargo test --test gateway_loom_tests --release
RUSTFLAGS="--cfg loom" cargo test --test hnsw_loom_tests --release

Lincheck Linearizability Tests
bash
cargo test --test lincheck_worker_pool

Criterion Benchmarks
bash
# Run criterion benchmarks
cargo bench

# Run specific benchmarks
cargo bench hvector_bench
cargo bench storage_bench

Stress Tests
bash
# Run integration stress tests (serialized)
cargo test --test integration_stress_tests --release

## Test Organization Guidelines

When adding new tests, follow these patterns:

1. Choose the appropriate tier based on what you're testing:
   - Pure functions/data structures -> Tier 1 (unit)
   - Component interactions/file I/O -> Tier 2 (integration)
   - Thread safety/concurrency -> Tier 3 (loom/lincheck)
   - Load/failure scenarios -> Tier 4 (stress)
   - Configuration/compatibility -> Tier 5
   - Performance characteristics -> Tier 6 (benchmarks)

2. Use appropriate isolation:
   - TempDir for file-based resources
   - Feature flags for LMDB-dependent code
   - Serialization attributes for shared resource tests

3. Leverage existing patterns:
   - Follow property-based testing patterns from protocol/custom_serde/property_based_tests.rs
   - Follow Loom patterns from existing *_loom_tests.rs files
   - Follow benchmark patterns from benches/criterion/ directory

4. Document test purpose:
   - Clear test names describing what is being verified
   - Comments explaining non-obvious test logic
   - References to related issues or design documents

## CI Integration

The testing strategy is integrated into CI through:

1. Fast Path (runs on every PR):
   - Unit tests (Tier 1)
   - Integration tests (Tier 2) 
   - Loom concurrency tests (Tier 3 subset)
   - Basic lincheck tests

2. Nightly/Scheduled (runs on schedule):
   - Full test suite including stress tests
   - Performance benchmarking with regression detection
   - Configuration/compatibility testing
   - Extended lincheck and loom testing

3. Manual/On-demand:
   - Full benchmark suites
   - Extended stress testing
   - Feature-specific testing matrices

This testing strategy ensures that SensibleDB maintains high correctness standards while providing fast feedback for developers and comprehensive validation before releases.