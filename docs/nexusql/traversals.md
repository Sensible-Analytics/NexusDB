# Graph Traversals

## Out - Outgoing Nodes

```nql
QUERY GetUserFollowing(user_id: ID) =>
    following <- N<User>(user_id)::Out<Follows>
    RETURN following
```

## In - Incoming Nodes

```nql
QUERY GetUserFollowers(user_id: ID) =>
    followers <- N<User>(user_id)::In<Follows>
    RETURN followers
```

## OutE - Outgoing Edges

```nql
QUERY GetFollowingEdges(user_id: ID) =>
    edges <- N<User>(user_id)::OutE<Follows>
    RETURN edges
```

## InE - Incoming Edges

```nql
QUERY GetFollowerEdges(user_id: ID) =>
    edges <- N<User>(user_id)::InE<Follows>
    RETURN edges
```

## Chaining

```nql
QUERY GetFriendsOfFriends(user_id: ID) =>
    fof <- N<User>(user_id)::Out<Follows>::Out<Follows>
    RETURN fof
```

## Shortest Path

```nql
QUERY FindPath(from_id: ID, to_id: ID) =>
    path <- N<User>(from_id)::ShortestPath<N<User>(to_id)>
    RETURN path
```

