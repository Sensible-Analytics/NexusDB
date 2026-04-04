# Nexus CLI Guide

## Installation

```bash
curl -sSL "https://install.nexus-db.com" | bash
nexus --version
```

## Commands

| Command | Description |
|---------|-------------|
| nexus init | Initialize a new project |
| nexus check | Validate schema and queries |
| nexus push dev | Deploy to local instance |
| nexus status | Show instance status |
| nexus start | Start an instance |
| nexus stop | Stop an instance |
| nexus logs | Stream instance logs |
| nexus prune | Clean up unused resources |
| nexus update | Update CLI |

## Project Structure

```
my-project/
+-- nexus.toml      # Project configuration
+-- db/
|   +-- schema.hx   # Schema definitions
|   +-- queries.hx  # Query definitions
+-- .nexus/         # Build artifacts
```

