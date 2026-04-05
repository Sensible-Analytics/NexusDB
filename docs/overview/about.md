# About SensibleDB

SensibleDB is an open-source graph-vector database built from scratch in Rust, designed specifically for AI applications, agents, and Retrieval-Augmented Generation (RAG) systems.

## Core Purpose

SensibleDB eliminates the complexity of managing multiple specialized databases by combining graph relationships, vector embeddings, and traditional data storage in a single, cohesive platform. This integrated approach allows developers to build AI-powered applications without the overhead of maintaining separate application DBs, vector stores, graph databases, and application layers.

## Key Characteristics

- **Graph-Vector Data Model**: Native support for both graph relationships and vector embeddings
- **Rust Implementation**: Memory-safe, high-performance systems programming language
- **Embedded Mode**: Zero-dependency usage in Rust applications
- **Type-Safe Queries**: Compile-time validation of SensibleQL queries
- **Built-in AI Tooling**: MCP support, automatic embeddings, vector search
- **Secure by Design**: Private by default access through compiled queries

## Problem SensibleDB Solves

Traditional AI application architectures require coordinating between:
- Application database (PostgreSQL/MySQL) for user data and metadata
- Vector database (Pinecone/Weaviate) for embeddings and similarity search  
- Graph database (Neo4j/TigerGraph) for relationship traversal
- Cache layer (Redis) for performance optimization
- Search engine (Elasticsearch) for text search
- Custom application layers to glue everything together

SensibleDB consolidates these concerns into a single database that understands the interconnected nature of AI data: entities have both properties (traditional data), relationships (graph structure), and semantic meaning (vector embeddings).

## Target Audience

- AI/ML engineers building RAG systems and intelligent agents
- Backend developers wanting to simplify AI application infrastructure
- Data engineers working with knowledge graphs and semantic search
- Rust developers seeking high-performance database solutions
- Teams looking to reduce operational complexity in AI deployments

## Getting Started

See the [Getting Started Guide](./getting-started.md) for installation and first steps, or explore the [Key Features](../features/README.md) to understand what makes SensibleDB unique.