# Table Partitioning in SensibleDB

SensibleDB supports table partitioning to improve query performance and manageability for large datasets. Partitioning allows you to divide a large table into smaller, more manageable pieces while maintaining the logical appearance of a single table.

## Range Partitioning

Range partitioning divides data based on ranges of values in one or more columns. This is particularly useful for time-series data or data that naturally falls into sequential ranges.

### Syntax

```sql
CREATE TABLE measurements (
    id INTEGER PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    value REAL,
    sensor_id INTEGER
) PARTITION BY RANGE (timestamp);
```

### Example: Time-Series Data

For storing sensor readings collected over time:

```sql
CREATE TABLE sensor_data (
    reading_id INTEGER PRIMARY KEY,
    device_id INTEGER NOT NULL,
    recorded_at TIMESTAMP NOT NULL,
    temperature REAL,
    humidity REAL
) PARTITION BY RANGE (recorded_at);

-- Partitions are automatically created as needed
-- Each partition contains data for a specific time range
```

### Benefits

- **Query Performance**: Queries with timestamp filters only scan relevant partitions
- **Data Management**: Old partitions can be archived or dropped easily
- **Maintenance**: Indexes and vacuum operations work on smaller datasets

## List Partitioning

List partitioning divides data based on discrete values in a partitioning column. This is useful for categorical data like regions, departments, or status values.

### Syntax

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    region TEXT NOT NULL,
    status TEXT
) PARTITION BY LIST (region);
```

### Example: Geographic Distribution

For distributing user data by geographic region:

```sql
CREATE TABLE user_profiles (
    user_id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    region TEXT NOT NULL CHECK (region IN ('US', 'EU', 'APAC', 'LATAM')),
    last_login TIMESTAMP
) PARTITION BY LIST (region);
```

### Automatic Partition Creation

SensibleDB automatically creates partitions when data is inserted for a new partition key value, up to a configurable limit.

## Hash Partitioning

Hash partitioning distributes data evenly across partitions based on a hash of the partitioning column. This is useful when you want to distribute data evenly without knowing the distribution in advance.

### Syntax

```sql
CREATE TABLE events (
    event_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    payload JSON,
    occurred_at TIMESTAMP
) PARTITION BY HASH (user_id) PARTITIONS 16;
```

### Example: User Activity Tracking

For distributing user activity events evenly:

```sql
CREATE TABLE user_activity (
    activity_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    timestamp TIMESTAMP,
    metadata JSON
) PARTITION BY HASH (user_id) PARTITIONS 32;
```

### Benefits

- **Even Distribution**: Data is spread uniformly across partitions
- **Predictable Performance**: No hot partitions from skewed data
- **Scalability**: Easy to increase partition count as data grows

## Composite Partitioning

Composite partitioning combines two partitioning methods for more granular control. First partition by one method, then sub-partition each partition by another method.

### Syntax

```sql
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY,
    account_id INTEGER NOT NULL,
    transaction_time TIMESTAMP NOT NULL,
    amount REAL,
    category TEXT
) PARTITION BY RANGE (transaction_time) SUBPARTITION BY HASH (account_id);
```

### Example: Financial Transactions

For organizing financial data by time and distributing accounts:

```sql
CREATE TABLE financial_transactions (
    txn_id INTEGER PRIMARY KEY,
    account_id INTEGER NOT NULL,
    txn_time TIMESTAMP NOT NULL,
    amount REAL,
    category TEXT
) PARTITION BY RANGE (txn_time) 
  SUBPARTITION BY HASH (account_id) 
  SUBPARTITIONS 8;
```

## Partition Management

### Viewing Partition Information

Use the `nexus-partitions` command-line tool or query the `nexus_partitions` virtual table:

```sql
SELECT * FROM nexus_partitions WHERE table_name = 'sensor_data';
```

### Adding Partitions

Partitions are automatically created when needed for range and list partitioning. For hash partitioning, the number of partitions is fixed at table creation.

### Dropping Partitions

Old partitions can be removed using standard DDL commands:

```sql
-- Drop a specific range partition
ALTER TABLE sensor_data DROP PARTITION FOR VALUES FROM ('2023-01-01') TO ('2023-02-01');

-- Or drop by partition name (if known)
ALTER TABLE sensor_data DROP PARTITION p2023_01;
```

### Maintenance Operations

Standard table maintenance operations work on partitions:

```sql
-- Vacuum a specific partition
VACUUM PARTITION sensor_data FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Rebuild indexes on a partition
REINDEX PARTITION sensor_data FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## Query Optimization with Partitioning

SensibleDB's query optimizer automatically eliminates partitions that cannot contain relevant data based on query predicates.

### Partition Pruning Examples

These queries will only scan relevant partitions:

```sql
-- Only scans January 2024 partitions
SELECT * FROM sensor_data 
WHERE recorded_at >= '2024-01-01' AND recorded_at < '2024-02-01';

-- Only scans specific regions
SELECT * FROM user_profiles 
WHERE region IN ('US', 'EU');

-- Only scans specific hash partitions (when using equality on partition key)
SELECT * FROM user_activity 
WHERE user_id = 12345;
```

### Limitations

- Partition key cannot be updated in-place (requires delete/insert)
- Foreign key relationships cannot reference partitioned tables
- Certain advanced index types may not be available on partitioned tables
- Maximum of 1024 partitions per table (configurable)

## Performance Considerations

### When to Use Partitioning

Consider partitioning when:
- Tables exceed 10GB in size
- Queries frequently filter by date, region, or category
- Data has natural temporal or categorical groupings
- Maintenance windows need to target specific data subsets

### When Not to Use Partitioning

Avoid partitioning when:
- Tables are small (< 1GB)
- Queries rarely filter by the partitioning column
- Workload involves frequent updates to partition keys
- Simplicity is preferred over performance optimization

## Related Topics

- [Indexes on Expressions](./indexes-on-expressions.md) - For indexing partitioning keys
- [Query Optimizer](./overview-of-the-query-optimizer.md) - How partition pruning works
- [Virtual Tables](./virtual-tables.md) - The `nexus_partitions` virtual table
- [Limits](./limits.md) - Configuration limits for partitioning