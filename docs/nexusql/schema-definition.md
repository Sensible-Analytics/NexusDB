# Schema Definition

## Node Schema

```nql
N::User {
    INDEX name: String,
    email: String,
    age: U32,
    created_at: Date DEFAULT NOW
}
```

## Edge Schema

```nql
E::Follows {
    From: User,
    To: User,
    Properties: {
        since: Date
    }
}
```

## Supported Types

| Type | Description |
|------|-------------|
| String | UTF-8 text |
| I32, I64 | Signed integers |
| U8, U32, U64 | Unsigned integers |
| F32, F64 | Floating point |
| Boolean | True/false |
| Date | Timestamp |
| ID | Unique identifier |
| Vector | Float array |

