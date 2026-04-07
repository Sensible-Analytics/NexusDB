# SensibleDB CLI Guide

The CLI is called **nexus** — it's your command-line tool for managing SensibleDB projects.

## Installation (Build from Source)

```bash
git clone https://github.com/Sensible-Analytics/SensibleDB.git
cd SensibleDB
cargo install --path sensibledb-cli
nexus --version
```

> **Note**: The install script (install.sensibledb-db.com) is temporarily unavailable.

## Commands

| Command | Description |
|---------|-------------|
| `nexus init` | Initialize a new project with sensibledb.toml |
| `nexus check` | Validate schema and queries |
| `nexus push dev` | Deploy to local instance |
| `nexus status` | Show instance status |
| `nexus start` | Start an instance |
| `nexus stop` | Stop an instance |
| `nexus logs` | Stream instance logs |
| `nexus prune` | Clean up unused resources |
| `nexus update` | Update CLI |

## Project Structure

```
my-project/
+-- sensibledb.toml      # Project configuration
+-- db/
|   +-- schema.hx   # Schema definitions (.hx files)
|   +-- queries.hx  # Query definitions
+-- .sensibledb/         # Build artifacts
```

## Common Workflows

### Initialize and Deploy

```bash
# Create a new project
nexus init my-project
cd my-project

# Write your schema in db/schema.hx
# Write your queries in db/queries.hx

# Validate and deploy locally
nexus check
nexus push dev

# Your API is now live at http://localhost:6969
```

### Query Your Instance

```bash
# Test a query
curl -X POST http://localhost:6969/getUser \
  -H "Content-Type: application/json" \
  -d '{"user_name": "John"}'
```

