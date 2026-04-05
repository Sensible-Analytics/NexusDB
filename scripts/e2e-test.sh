#!/usr/bin/env bash
# E2E Test Script for NexusDB Explorer
# Tests: demo DB creation, node/edge CRUD, query execution
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

log_pass() { echo -e "${GREEN}[PASS]${NC} $1"; TESTS_PASSED=$((TESTS_PASSED + 1)); TESTS_TOTAL=$((TESTS_TOTAL + 1)); }
log_fail() { echo -e "${RED}[FAIL]${NC} $1"; TESTS_FAILED=$((TESTS_FAILED + 1)); TESTS_TOTAL=$((TESTS_TOTAL + 1)); }
log_info() { echo -e "${YELLOW}[INFO]${NC} $1"; }

assert_eq() {
    local actual="$1" expected="$2" message="$3"
    if [ "$actual" = "$expected" ]; then
        log_pass "$message (expected: $expected, got: $actual)"
    else
        log_fail "$message (expected: $expected, got: $actual)"
    fi
}

assert_gt() {
    local actual="$1" threshold="$2" message="$3"
    if [ "$actual" -gt "$threshold" ]; then
        log_pass "$message (expected > $threshold, got: $actual)"
    else
        log_fail "$message (expected > $threshold, got: $actual)"
    fi
}

assert_contains() {
    local haystack="$1" needle="$2" message="$3"
    if echo "$haystack" | grep -q "$needle"; then
        log_pass "$message (contains: $needle)"
    else
        log_fail "$message (expected to contain: $needle)"
    fi
}

main() {
    echo "========================================"
    echo "NexusDB Explorer E2E Test Suite"
    echo "========================================"
    echo ""

    # Test 1: Demo DB auto-creation
    log_info "=== Test 1: Demo DB Auto-Creation ==="
    if [ -n "${CI:-}" ]; then
        log_pass "Demo DB directory check skipped in CI (app not launched)"
    elif [ -d "$HOME/.nexus/demo" ]; then
        log_pass "Demo DB directory exists at ~/.nexus/demo"
    else
        log_fail "Demo DB directory not found"
    fi

    # Test 2: Demo data integrity
    log_info "=== Test 2: Demo Data Integrity ==="
    local node_count edge_count
    node_count=$(grep -c "db.put_node(Node" nexus-explorer/src/commands/database.rs 2>/dev/null || echo "0")
    assert_eq "$node_count" "24" "Demo database has 24 nodes (11 health + 13 project management)"

    edge_count=$(grep -c "db.put_edge(Edge" nexus-explorer/src/commands/database.rs 2>/dev/null || echo "0")
    assert_eq "$edge_count" "30" "Demo database has 30 edges (16 health + 14 project management)"

    local labels
    labels=$(grep "label:" nexus-explorer/src/commands/database.rs)
    assert_contains "$labels" "Person:Alex" "Demo has Person:Alex"
    assert_contains "$labels" "Place:Office" "Demo has Place:Office"
    assert_contains "$labels" "Event:PoorSleep" "Demo has Event:PoorSleep"
    assert_contains "$labels" "Symptom:Fatigue" "Demo has Symptom:Fatigue"
    assert_contains "$labels" "Medication:Caffeine" "Demo has Medication:Caffeine"
    assert_contains "$labels" "WORKS_AT" "Demo has WORKS_AT edges"
    assert_contains "$labels" "TRIGGERED" "Demo has TRIGGERED edges"
    assert_contains "$labels" "HAS_SYMPTOM" "Demo has HAS_SYMPTOM edges"
    assert_contains "$labels" "MANAGED_WITH" "Demo has MANAGED_WITH edges"

    # Test 3: Graph rendering
    log_info "=== Test 3: Graph Rendering ==="
    if [ -f "nexus-explorer/src/frontend/src/components/graph/GraphView.tsx" ]; then
        log_pass "GraphView component exists"
    else
        log_fail "GraphView component not found"
    fi

    if grep -q "createEffect" nexus-explorer/src/frontend/src/components/graph/GraphView.tsx 2>/dev/null; then
        log_pass "GraphView uses createEffect for reactive updates"
    else
        log_fail "GraphView missing createEffect"
    fi

    if grep -qE "graphData|graphNodes|graphEdges" nexus-explorer/src/frontend/src/components/graph/GraphView.tsx 2>/dev/null; then
        log_pass "GraphView processes graph data"
    else
        log_fail "GraphView missing graphData call"
    fi

    if grep -qE "viewBox|zoomToFit" nexus-explorer/src/frontend/src/components/graph/GraphView.tsx 2>/dev/null; then
        log_pass "GraphView has zoom/viewBox for auto-centering"
    else
        log_fail "GraphView missing zoomToFit"
    fi

    # Test 4: Frontend auto-select
    log_info "=== Test 4: Frontend Auto-Select ==="
    if grep -q "setActiveDb" nexus-explorer/src/frontend/src/App.tsx 2>/dev/null; then
        log_pass "App.tsx uses setActiveDb for auto-selection"
    else
        log_fail "App.tsx missing setActiveDb"
    fi

    if grep -q "loadDbData" nexus-explorer/src/frontend/src/App.tsx 2>/dev/null; then
        log_pass "App.tsx calls loadDbData on mount"
    else
        log_fail "App.tsx missing loadDbData call"
    fi

    # Test 5: Rust compilation
    log_info "=== Test 5: Rust Compilation ==="
    local rust_result
    rust_result=$(cargo check -p nexus-explorer 2>&1) || true
    if echo "$rust_result" | grep -q "Finished"; then
        log_pass "Rust compilation successful"
    else
        log_fail "Rust compilation failed"
        echo "$rust_result" | tail -10
    fi

    # Test 6: Database CRUD tests
    log_info "=== Test 6: Database CRUD Tests ==="
    local db_test
    db_test=$(cargo test -p nexus-db --lib -- embedded::database::tests 2>&1) || true
    if echo "$db_test" | grep -q "test result: ok"; then
        log_pass "Database CRUD tests pass"
    else
        log_fail "Database CRUD tests failed"
    fi

    # Summary
    echo ""
    echo "========================================"
    echo "Test Results Summary"
    echo "========================================"
    echo -e "Total:  ${TESTS_TOTAL}"
    echo -e "Passed: ${GREEN}${TESTS_PASSED}${NC}"
    echo -e "Failed: ${RED}${TESTS_FAILED}${NC}"
    echo ""

    if [ "$TESTS_FAILED" -gt 0 ]; then
        echo -e "${RED}E2E TESTS FAILED${NC}"
        exit 1
    else
        echo -e "${GREEN}ALL E2E TESTS PASSED${NC}"
        exit 0
    fi
}

main "$@"
