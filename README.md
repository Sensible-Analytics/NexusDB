<hr>


NexusDB is a database that makes it easy to build all the components needed for an AI application in a single platform.

You no longer need a separate application DB, vector DB, graph DB, or application layers to manage the multiple storage locations to build the backend of any application that uses AI, agents or RAG. Just use Nexus.

NexusDB primarily operates with a graph + vector data model, but it can also support KV, documents, and relational data.

### Get started with NexusDB

<div align="center">                                                                                                                                                                                                                                                                                                                                                                                   
    <img src="/assets/readmeinit.gif" alt="Nexus CLI Demo" width="100%">                                                                                                                                                                                                                                                                                                                                              
</div>  

--- 

## Key Features

|                         |                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Built-in MCP tools**  | Nexus has built-in MCP support to allow your agents to discover data and walk the graph rather than generating human readable queries. |
| **Built-in Embeddings** | No need to embed your data before sending it to Nexus, just use the `Embed` function to vectorize text.                                |
| **Tooling for RAG**     | NexusDB has a built-in vector search, keyword search, and graph traversals that can be used to power any type of RAG applications.     |
| **Secure by Default**   | NexusDB is private by default. You can only access your data through your compiled NexusQL queries.                                    |
| **Ultra-Low Latency**   | Nexus is built in Rust and uses LMDB as its storage engine to provide extremely low latencies.                                         |
| **Type-Safe Queries**   | NexusQL is 100% type-safe, which lets you develop and deploy with the confidence that your queries will execute in production          |
| **Embedded Mode**       | Use NexusDB as a lightweight embedded database in your Rust applications with zero external dependencies.                               |

## Embedded Mode

NexusDB can be used as an embedded database in Rust applications. Enable with the `embedded` feature:

```toml
[dependencies]
nexus-db = { version = "1.3", features = ["embedded"] }
```

### Quick Start (Embedded)

```rust
use nexus_db::embedded::{Database, Node};

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

#### Nexus CLI

Start by installing the Nexus CLI tool to deploy Nexus locally.

1. Install CLI

   ```bash
   curl -sSL "https://install.nexus-db.com" | bash
   ```

2. Initialize a project

   ```bash
   mkdir <path-to-project> && cd <path-to-project>
   nexus init
   ```

3. Write queries

   Open your newly created `.hx` files and start writing your schema and queries.
   Head over to [our docs](https://docs.nexus-db.com/documentation/hql/hql) for more information about writing queries.

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
   nexus check
   ```

5. Deploy your queries to their API endpoints

   ```bash
   nexus push dev
   ```

6. Start calling them using our [TypeScript SDK](https://github.com/NexusDB/nexus-ts) or [Python SDK](https://github.com/NexusDB/nexus-py). For example:

   ```typescript
   import NexusDB from "nexus-ts";

   // Create a new NexusDB client
   // The default port is 6969
   const client = new NexusDB();

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

## License

NexusDB is licensed under the The AGPL (Affero General Public License).

## Commercial Support

NexusDB is available as a managed service for selected users, if you're interested in using Nexus's managed service or want enterprise support, [contact](mailto:founders@nexus-db.com) us for more information and deployment options.

---

Just Use Nexus

## Contributors

<a href="https://github.com/rprabhat">
  <img src="https://avatars.githubusercontent.com/rprabhat?s=64" width="64" height="64" alt="rprabhat" />
</a>
