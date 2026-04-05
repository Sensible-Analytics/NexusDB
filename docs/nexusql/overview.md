# What is SensibleQL?

SensibleQL is a **strongly typed, compiled query language** for SensibleDB.

## Why SensibleQL?

| Feature | SensibleQL | Gremlin | Cypher |
|---------|---------|---------|--------|
| Type Safety | Compile-time | Runtime | Runtime |
| Performance | Compiled | Interpreted | Interpreted |
| Vector Support | Built-in | External | External |

## Query Structure

```nql
QUERY QueryName(param1: Type, param2: Type) =>
    result <- traversal_expression
    RETURN result
```

## Example

```nql
N::User {
    INDEX name: String,
    age: U32
}

E::Follows {
    From: User,
    To: User,
    Properties: { since: Date }
}

QUERY createUser(name: String, age: U32) =>
    user <- AddN<User>({name: name, age: age})
    RETURN user

QUERY getUserFollowers(user_id: ID) =>
    followers <- N<User>(user_id)::In<Follows>
    RETURN followers
```

