# SDKs Overview

**Note**: The SensibleDB SDKs for TypeScript and Python are currently in development. See the [GitHub issue](https://github.com/Sensible-Analytics/SensibleDB/issues) for progress updates.

---

## TypeScript SDK *(Coming Soon)*

The TypeScript SDK is being developed. For now, you can use HTTP directly:

```typescript
// Using fetch directly (until SDK is ready)
const response = await fetch("http://localhost:6969/getUser", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ user_name: "John" })
});
const user = await response.json();
```

## Python SDK *(Coming Soon)*

The Python SDK is being developed. For now, you can use requests directly:

```python
import requests

# Query the database directly
response = requests.post(
    "http://localhost:6969/getUser",
    json={"user_name": "John"}
)
user = response.json()
print(user)
```

## Rust SDK (Available Now)

For maximum control, embed SensibleDB directly in your Rust application:

```toml
[dependencies]
sensibledb-db = { version = "1.3", features = ["embedded"] }
```

```rust
use sensibledb_db::embedded::{Database, Node, Edge};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Open or create a database
    let db = Database::open("./my_db")?;
    
    // Start a write transaction
    let mut tx = db.write_transaction()?;
    
    // Create a node
    tx.put_node(Node {
        id: 1,
        label: "User".into(),
    })?;
    
    // Create an edge
    tx.put_edge(Edge {
        id: 100,
        label: "KNOWS".into(),
        from: 1,
        to: 2,
    })?;
    
    // Commit the transaction
    tx.commit()?;
    
    Ok(())
}
```

## API Reference

| Method | Description |
|--------|-------------|
| HTTP POST `/QueryName` | Execute any SensibleQL query by name |
| `client.connect(instance)` | Connect to a specific instance |
| `client.disconnect()` | Close the connection |

For full API documentation, see the [Rust Embedded API](./programming-interfaces/5-minutes.md).

## Contributing SDKs

Want to help build the TypeScript or Python SDK? 
[Contributions welcome](https://github.com/Sensible-Analytics/SensibleDB/blob/main/CONTRIBUTORS.md)!

