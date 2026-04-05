# SensibleDB in 5 Minutes or Less

A quick introduction to programming with SensibleDB. This guide will get you up and running with basic operations in just a few minutes.

## Installation

First, add SensibleDB to your Cargo.toml:

```toml
[dependencies]
sensibledb-db = { version = "1.3", features = ["embedded"] }
```

## Basic CRUD Operations

Here's how to perform basic Create, Read, Update, Delete operations:

```rust
use sensibledb_db::embedded::{Database, Node, Edge};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Open or create a database
    let db = Database::open("./my_sensibledb_db")?;
    
    // Start a write transaction
    let mut tx = db.write_transaction()?;
    
    // Create a node
    let user_node = Node {
        id: 1,
        label: "User".to_string(),
    };
    tx.put_node(user_node)?;
    
    // Create an edge
    let likes_edge = Edge {
        id: 100,
        label: "LIKES".to_string(),
        from: 1,
        to: 2, // Will create node 2 implicitly in this example
    };
    tx.put_edge(likes_edge)?;
    
    // Commit the transaction
    tx.commit()?;
    
    // Read data with a read transaction
    let read_tx = db.read_transaction()?;
    let user = read_tx.get_node(1)?;
    println!("Found user: {:?}", user);
    
    Ok(())
}
```

## Vector Search Example

SensibleDB includes built-in vector similarity search:

```rust
use sensibledb_db::embedded::{Database, Node};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let db = Database::open("./my_sensibledb_db")?;
    let mut tx = db.write_transaction()?;
    
    // Create nodes with vector embeddings
    let dog_node = Node {
        id: 1,
        label: "Dog".to_string(),
        // In a real implementation, you'd set vector properties here
        // This would typically be done through SensibleQL or specific vector APIs
    };
    tx.put_node(dog_node)?;
    
    let cat_node = Node {
        id: 2,
        label: "Cat".to_string(),
    };
    tx.put_node(cat_node)?;
    
    tx.commit()?;
    
    // Perform vector similarity search (conceptual example)
    // Actual implementation would use SensibleQL or specific vector search APIs
    let read_tx = db.read_transaction()?;
    let nodes = read_tx.scan_nodes()?;
    println!("Found {} nodes", nodes.len());
    
    Ok(())
}
```

## Graph Traversal Example

Explore relationships in your data:

```rust
use sensibledb_db::embedded::{Database, Node, Edge};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let db = Database::open("./my_sensibledb_db")?;
    let mut tx = db.write_transaction()?;
    
    // Create a simple graph: Alice -> knows -> Bob -> knows -> Charlie
    let alice = Node { id: 1, label: "Person".to_string() };
    let bob = Node { id: 2, label: "Person".to_string() };
    let charlie = Node { id: 3, label: "Person".to_string() };
    
    tx.put_node(alice)?;
    tx.put_node(bob)?;
    tx.put_node(charlie)?;
    
    let knows_ab = Edge { id: 10, label: "KNOWS".to_string(), from: 1, to: 2 };
    let knows_bc = Edge { id: 20, label: "KNOWS".to_string(), from: 2, to: 3 };
    
    tx.put_edge(knows_ab)?;
    tx.put_edge(knows_bc)?;
    
    tx.commit()?;
    
    // Traverse the graph (conceptual - actual traversal APIs would be used)
    let read_tx = db.read_transaction()?;
    let nodes = read_tx.scan_nodes()?;
    let edges = read_tx.scan_edges()?;
    
    println!("Graph contains {} nodes and {} edges", nodes.len(), edges.len());
    
    Ok(())
}
```

## Next Steps

- Check out the [API Reference](./api-reference.md) for complete documentation
- Learn about [SensibleQL](../query-language/syntax.md) for powerful querying
- Explore the [Features](../features/README.md) to understand advanced capabilities
- See the [Getting Started Guide](../../overview/getting-started.md) for more detailed examples