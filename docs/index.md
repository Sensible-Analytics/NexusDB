# SensibleDB

**Embedded Graph-Vector Database for AI Applications**

SensibleDB is a unified database that makes it easy to build all the components needed for an AI application in a single platform. You no longer need a separate application DB, vector DB, graph DB, or application layers managing multiple storage locations.

Built in Rust with LMDB as its storage engine — like SQLite for knowledge graphs.

---

## Choose Your Path

| I want to... | Start here |
|---|---|
| **Organize my personal documents** and search through them using AI | [SensibleDB Explorer](#explorer-quick-start) — Desktop app for non-technical users |
| **Build AI applications** with a knowledge base | [CLI Quick Start](#cli-quick-start) — For developers |
| **Store memory for AI agents** | [Embedded Mode](#embedded-quick-start) — For Rust developers |

---

<a id="explorer-quick-start"></a>
## SensibleDB Explorer — Your Personal Knowledge App

*For non-technical users who want to organize and search their personal documents.*

### Why SensibleDB Explorer?

- **100% Local-First** — Your documents never leave your computer. No cloud, nothing sent externally.
- **Works Offline** — Disconnect your internet and keep using the app.
- **Chat with Your Documents** — Ask questions in plain English, get answers from your files.

### Get Started

1. Download SensibleDB Explorer for macOS
2. Launch the app
3. Click "Add Folder" → select your documents folder
4. Start chatting!

---

<a id="cli-quick-start"></a>
## CLI Quick Start — For Developers

### 1. Install the CLI (build from source)

```bash
git clone https://github.com/Sensible-Analytics/SensibleDB.git
cd SensibleDB
cargo install --path sensibledb-cli
```

> **Note**: The install script is temporarily unavailable. Use source build above.

### 2. Initialize a Project

```bash
mkdir my-project && cd my-project
nexus init
```

### 3. Write Your Schema & Queries

Open the generated `.hx` file and define your schema:

```sensibleql
N::User {
    INDEX name: String,
    age: U32
}

E::FRIENDS {
    from: User,
    to: User
}

QUERY getUser(user_name: String) =>
    user <- N<User>({name: user_name})
    RETURN user

QUERY getFriends(user_id: U64) =>
    user <- N<User>({id: user_id})
    friends <- TRAVERSE user -[FRIENDS]-> friend
    RETURN friend
```

### 4. Deploy

```bash
nexus push dev
```

### 5. Use in Your Application

**TypeScript (use HTTP directly):**

```typescript
// SDK coming soon - use HTTP for now
const response = await fetch("http://localhost:6969/getUser", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ user_name: "John" })
});
const user = await response.json();
```

**Python (use requests directly):**

```python
import requests

response = requests.post(
    "http://localhost:6969/getUser",
    json={"user_name": "John"}
)
user = response.json()
print(user)
```

> **Note**: TypeScript and Python SDKs are in development. Track progress on [GitHub](https://github.com/Sensible-Analytics/SensibleDB/issues).

---

<a id="embedded-quick-start"></a>
## Embedded Mode — For Rust Developers

For full control, embed SensibleDB directly in your application:

```toml
[dependencies]
sensibledb-db = { version = "1.3", features = ["embedded"] }
```

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

---

## Key Features

- **100% Local-First** — Runs entirely on your machine, no external calls
- **Built-in Embeddings** — Vectorize text directly in queries with `Embed()`
- **RAG Tooling** — Vector search, keyword search, and graph traversals out of the box
- **Secure by Default** — Private by default; access only through compiled SensibleQL queries
- **Ultra-Low Latency** — Rust + LMDB storage engine for extreme performance
- **Type-Safe Queries** — SensibleQL is 100% type-safe, catch errors at compile time
- **MCP Ready** — *(Coming Soon)* Connect AI agents via MCP server

---

## Documentation

| Section | Description |
|---|---|
| [Getting Started](getting-started/intro.md) | Installation and setup |
| [SensibleQL](sensibleql/overview.md) | Query language reference |
| [CLI](cli/getting-started.md) | Command-line tool guide (called "nexus") |
| [SDKs](sdks/overview.md) | TypeScript, Python, and Rust SDKs |
| [Features](features/overview.md) | Full feature overview |
| [Programming Interfaces](programming-interfaces/5-minutes.md) | Rust embedded API in 5 minutes |

---

