use crate::sensibledb_engine::{
    storage_core::SensibleGraphStorage,
    traversal_core::{
        traversal_iter::{RoTraversalIterator, RwTraversalIterator},
        traversal_value::TraversalValue,
    },
    types::GraphError,
};
use heed3::{RoTxn, RwTxn};

pub struct G {}

impl G {
    /// Starts a new empty traversal
    ///
    /// # Arguments
    ///
    /// * `storage` - An owned Arc of the storage for the traversal
    /// * `txn` - A reference to the transaction for the traversal
    ///
    /// # Example
    ///
    /// ```rust,ignore
    /// use sensibledb_db::{SensibleGraphStorage, G};
    /// use bumpalo::Bump;
    /// let storage = SensibleGraphStorage::new();
    /// let arena = Bump::new();
    /// let txn = storage.graph_env.read_txn().unwrap();
    /// let traversal = G::new(&storage, &txn, &arena);
    /// ```
    #[inline]
    pub fn new<'db: 'arena, 'arena: 'txn, 'txn>(
        storage: &'db SensibleGraphStorage,
        txn: &'txn RoTxn<'db>,
        arena: &'arena bumpalo::Bump,
    ) -> RoTraversalIterator<
        'db,
        'arena,
        'txn,
        impl Iterator<Item = Result<TraversalValue<'arena>, GraphError>>,
    >
    where
        Self: Sized,
    {
        RoTraversalIterator {
            storage,
            txn,
            arena,
            inner: std::iter::once(Ok(TraversalValue::Empty)),
        }
    }

    /// Starts a new traversal from a vector of traversal values
    ///
    /// # Arguments
    ///
    /// * `storage` - An owned Arc of the storage for the traversal
    /// * `txn` - A reference to the transaction for the traversal
    /// * `items` - A vector of traversal values to start the traversal from
    ///
    /// # Example
    ///
    /// ```rust,ignore
    /// use sensibledb_db::{SensibleGraphStorage, G, TraversalValue};
    /// use bumpalo::Bump;
    /// let storage = SensibleGraphStorage::new();
    /// let arena = Bump::new();
    /// let txn = storage.graph_env.read_txn().unwrap();
    /// let traversal = G::from_iter(&storage, &txn, vec![TraversalValue::Empty], &arena);
    /// ```
    pub fn from_iter<'db: 'arena, 'arena: 'txn, 'txn>(
        storage: &'db SensibleGraphStorage,
        txn: &'txn RoTxn<'db>,
        items: impl Iterator<Item = TraversalValue<'arena>>,
        arena: &'arena bumpalo::Bump,
    ) -> RoTraversalIterator<
        'db,
        'arena,
        'txn,
        impl Iterator<Item = Result<TraversalValue<'arena>, GraphError>>,
    > {
        RoTraversalIterator {
            inner: items.map(Ok),
            storage,
            txn,
            arena,
        }
    }

    /// Starts a new mutable traversal
    ///
    /// # Arguments
    ///
    /// * `storage` - An owned Arc of the storage for the traversal
    /// * `txn` - A reference to the transaction for the traversal
    /// * `items` - A vector of traversal values to start the traversal from
    ///
    /// # Example
    ///
    /// ```rust,ignore
    /// use sensibledb_db::{SensibleGraphStorage, G};
    /// use bumpalo::Bump;
    /// let storage = SensibleGraphStorage::new();
    /// let arena = Bump::new();
    /// let txn = storage.graph_env.write_txn().unwrap();
    /// let traversal = G::new_mut(&storage, &arena, &mut txn);
    /// ```
    pub fn new_mut<'db: 'arena, 'arena: 'txn, 'txn>(
        storage: &'db SensibleGraphStorage,
        arena: &'arena bumpalo::Bump,
        txn: &'txn mut RwTxn<'db>,
    ) -> RwTraversalIterator<
        'db,
        'arena,
        'txn,
        impl Iterator<Item = Result<TraversalValue<'arena>, GraphError>>,
    >
    where
        Self: Sized,
    {
        RwTraversalIterator {
            storage,
            arena,
            txn,
            inner: std::iter::once(Ok(TraversalValue::Empty)),
        }
    }

    pub fn new_mut_from_iter<'db: 'arena, 'arena: 'txn, 'txn>(
        storage: &'db SensibleGraphStorage,
        txn: &'txn mut RwTxn<'db>,
        items: impl Iterator<Item = TraversalValue<'arena>>,
        arena: &'arena bumpalo::Bump,
    ) -> RwTraversalIterator<
        'db,
        'arena,
        'txn,
        impl Iterator<Item = Result<TraversalValue<'arena>, GraphError>>,
    > {
        RwTraversalIterator {
            inner: items.map(Ok),
            storage,
            txn,
            arena,
        }
    }

    /// Create a mutable traversal from a single TraversalValue
    pub fn new_mut_from<'db: 'arena, 'arena: 'txn, 'txn>(
        storage: &'db SensibleGraphStorage,
        txn: &'txn mut RwTxn<'db>,
        item: TraversalValue<'arena>,
        arena: &'arena bumpalo::Bump,
    ) -> RwTraversalIterator<
        'db,
        'arena,
        'txn,
        impl Iterator<Item = Result<TraversalValue<'arena>, GraphError>>,
    > {
        RwTraversalIterator {
            inner: std::iter::once(Ok(item)),
            storage,
            txn,
            arena,
        }
    }
}
