# SDKs Overview

## TypeScript SDK

```bash
npm install nexus-ts
```

```typescript
import NexusDB from "nexus-ts";
const client = new NexusDB();
const user = await client.query("getUser", { name: "John" });
```

## Python SDK

```bash
pip install nexus-py
```

```python
from nexus import Client
client = Client(local=True, port=6969)
user = client.query("getUser", {"name": "John"})
```

## Rust SDK (Embedded)

```toml
[dependencies]
nexus-db = { version = "1.3", features = ["embedded"] }
```

