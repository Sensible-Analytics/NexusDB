<p align="center">
  <img src="assets/sensible-db-logo.svg" alt="SensibleDB Logo" width="400">
</p>

<p align="center">
  <strong>Embedded Graph-Vector Database for AI Applications</strong>
</p>

<p align="center">
  <a href="https://sensible-analytics.github.io/SensibleDB/">Documentation</a> ·
  <a href="https://github.com/Sensible-Analytics/SensibleDB/issues">Issues</a> ·
  <a href="mailto:founders@sensibledb-db.com">Contact</a>
</p>

<hr>

SensibleDB, by [Sensible Analytics](https://github.com/Sensible-Analytics), is a unified database that makes it easy to build all the components needed for an AI application in a single platform.

You no longer need a separate application DB, vector DB, graph DB, or application layers to manage multiple storage locations. SensibleDB combines graph, vector, and embedded storage into one lightweight engine — like SQLite for knowledge graphs.

### SensibleDB Explorer

A beautiful, interactive UI for exploring your graph data visually.

<p align="center">
  <img src="assets/explorer-home.png" alt="SensibleDB Explorer - Home View" width="90%">
</p>

<p align="center">
  <img src="assets/explorer-graph.png" alt="SensibleDB Explorer - Graph View" width="90%">
</p>

<p align="center">
  <img src="assets/explorer-chat.png" alt="SensibleDB Explorer - Chat Interface" width="90%">
</p>

<p align="center">
  <img src="assets/explorer-report.png" alt="SensibleDB Explorer - Report View" width="90%">
</p>

---

## Key Features

|                         |                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Built-in MCP tools**  | SensibleDB has built-in MCP support to allow your agents to discover data and walk the graph rather than generating human readable queries. |
| **Built-in Embeddings** | No need to embed your data before sending it to SensibleDB, just use the `Embed` function to vectorize text.                                |
| **Tooling for RAG**     | SensibleDB has a built-in vector search, keyword search, and graph traversals that can be used to power any type of RAG applications.     |
| **Secure by Default**   | SensibleDB is private by default. You can only access your data through your compiled SensibleQL queries.                                    |
| **Ultra-Low Latency**   | SensibleDB is built in Rust and uses LMDB as its storage engine to provide extremely low latencies.                                         |
| **Type-Safe Queries**   | SensibleQL is 100% type-safe, which lets you develop and deploy with the confidence that your queries will execute in production          |
| **Embedded Mode**       | Use SensibleDB as a lightweight embedded database in your Rust applications with zero external dependencies.                               |
| **Visual Explorer**     | Interactive graph visualization, natural language chat, and automated report generation via the SensibleDB Explorer UI.                   |

## Embedded Mode

SensibleDB can be used as an embedded database in Rust applications. Enable with the `embedded` feature:

```toml
[dependencies]
sensibledb-db = { version = "1.3", features = ["embedded"] }
```

### Quick Start (Embedded)

```rust
use sensibledb_db::embedded::{Database, Node};

let db = Database::open("./my_db")?;
let mut tx = db.write_transaction()?;

tx.put_node(Node {
    id: 1,
    label: "User".into(),
})?;

tx.commit()?;
```

### Embedded Features

- **Storage**: In-memory storage with optional persistence
- **Graph**: Node/edge CRUD with transactions
- **Vector**: Cosine similarity search
- **Traversal**: BFS/DFS graph traversal
- **Indices**: Secondary indices for fast lookups

## Getting Started

#### SensibleDB CLI

Start by installing the SensibleDB CLI tool to deploy SensibleDB locally.

1. Install CLI

   ```bash
   curl -sSL "https://install.sensibledb-db.com" | bash
   ```

2. Initialize a project

   ```bash
   mkdir <path-to-project> && cd <path-to-project>
   sensibledb init
   ```

3. Write queries

   Open your newly created `.hx` files and start writing your schema and queries.
   Head over to [our docs](https://docs.sensibledb-db.com/) for more information about writing queries.

   ```js
   N::User {
      INDEX name: String,
      age: U32
   }

   QUERY getUser(user_name: String) =>
      user <- N<User>({name: user_name})
      RETURN user
   ```

4. (Optional) Check your queries compile

   ```bash
   sensibledb check
   ```

5. Deploy your queries to their API endpoints

   ```bash
   sensibledb push dev
   ```

6. Start calling them using our [TypeScript SDK](https://github.com/Sensible-Analytics/sensible-ts) or [Python SDK](https://github.com/Sensible-Analytics/sensible-py). For example:

   ```typescript
   import SensibleDB from "sensible-ts";

   // Create a new SensibleDB client
   // The default port is 6969
   const client = new SensibleDB();

   // Query the database
   await client.query("addUser", {
     name: "John",
     age: 20,
   });

   // Get the created user
   const user = await client.query("getUser", {
     user_name: "John",
   });

   console.log(user);
   ```

## Project Structure

```
SensibleDB/
├── sensibledb-db/          # Core database engine (Rust)
├── sensibledb-cli/         # Command-line interface
├── sensibledb-explorer/    # Visual graph explorer UI (Tauri + SolidJS)
├── sensibledb-container/   # Docker container deployment
├── sensibledb-macros/      # Procedural macros for SensibleQL
├── metrics/                # Telemetry and metrics
├── nql-tests/              # Query language test suite
├── e2e/                    # Playwright E2E tests (65 tests)
└── docs/                   # Documentation source
```

## Documentation

Full documentation is available at [https://sensible-analytics.github.io/SensibleDB/](https://sensible-analytics.github.io/SensibleDB/)

- [Getting Started](https://sensible-analytics.github.io/SensibleDB/getting-started/intro/)
- [SensibleQL Query Language](https://sensible-analytics.github.io/SensibleDB/sensibleql/overview/)
- [SDKs](https://sensible-analytics.github.io/SensibleDB/sdks/overview/)
- [Architecture](https://sensible-analytics.github.io/SensibleDB/architecture/diagrams/system-context/)

## License

SensibleDB is licensed under the AGPL (Affero General Public License).

## Commercial Support

SensibleDB is available as a managed service for selected users. If you're interested in using SensibleDB's managed service or want enterprise support, [contact](mailto:founders@sensibledb-db.com) us for more information and deployment options.

---

<p align="center">
  <a href="https://github.com/Sensible-Analytics">
    <img src="assets/sensible-db-icon.svg" alt="Sensible Analytics" width="48">
  </a>
  <br>
  <strong>Sensible Analytics</strong> — Making AI applications simpler with unified data storage.
</p>

## Contributors

<a href="https://github.com/rprabhat">
  <img src="https://avatars.githubusercontent.com/rprabhat?s=64" width="64" height="64" alt="rprabhat" />
</a>
