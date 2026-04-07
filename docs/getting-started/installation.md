# Installation

## Prerequisites

- **Rust** 1.75.0 or higher (only needed for building from source)
- **LMDB** system library (included with macOS/Linux)

## Installation Options

### Option 1: Build from Source (Recommended)

The SensibleDB CLI (called "nexus") can be built from source:

```bash
git clone https://github.com/Sensible-Analytics/SensibleDB.git
cd SensibleDB
cargo install --path sensibledb-cli
nexus --version
```

### Option 2: Download Pre-built Binary *(Coming Soon)*

Pre-built binaries for macOS, Linux, and Windows will be available on the GitHub releases page.

### Option 3: Homebrew *(Coming Soon)*

```bash
brew install sensibledb
```

> **Note**: The install script (install.sensibledb-db.com) is temporarily unavailable. Use the source build method above.

## Quick Start

### 1. Initialize Project

```bash
mkdir my-project && cd my-project
nexus init
```

### 2. Write Schema and Queries

**schema.hx:**
```sensibleql
N::User {
    INDEX name: String,
    email: String,
    created_at: Date DEFAULT NOW
}

E::Follows {
    From: User,
    To: User,
    Properties: { since: Date }
}
```

**queries.hx:**
```sensibleql
QUERY createUser(name: String, email: String) =>
    user <- AddN<User>({name: name, email: email})
    RETURN user

QUERY getUser(name: String) =>
    user <- N<User>({name: name})
    RETURN user
```

### 3. Check and Deploy

```bash
nexus check
nexus push dev
```

### 4. Test

```bash
curl -X POST http://localhost:6969/createUser \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'
```

## For Non-Technical Users: Try the Explorer UI

If you want to try SensibleDB without using the CLI:

1. Download SensibleDB Explorer for macOS
2. Launch and add your documents folder
3. Start searching!

## Best Practices

- Always run `nexus check` before deploying
- Use `build_mode = "release"` for production
- Never commit credentials to version control

