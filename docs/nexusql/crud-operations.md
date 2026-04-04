# CRUD Operations

## Create

```nql
QUERY createUser(name: String, email: String) =>
    user <- AddN<User>({name: name, email: email})
    RETURN user

QUERY followUser(from_id: ID, to_id: ID, since: Date) =>
    edge <- AddE<Follows>({since: since})::From(from_id)::To(to_id)
    RETURN edge
```

## Read

```nql
QUERY getUser(name: String) =>
    user <- N<User>({name: name})
    RETURN user
```

## Update

```nql
QUERY updateUserEmail(user_id: ID, email: String) =>
    updated <- N<User>(user_id)::Update({email: email})
    RETURN updated
```

## Delete

```nql
QUERY deleteUser(user_id: ID) =>
    N<User>(user_id)::Drop
    RETURN "Deleted"
```

