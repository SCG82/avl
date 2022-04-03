import { BareNode, Comparator, ForEachCallback, Node, TraverseCallback } from './types';
declare class AVLTree<K, V> {
    private _comparator;
    private _root;
    private _size;
    private _noDuplicates;
    constructor(comparator?: Comparator<K>, noDuplicates?: boolean);
    /** Number of nodes */
    get size(): number;
    /** Clear the tree */
    clear(): AVLTree<K, V>;
    /** Clear the tree (alias for `clear`) */
    destroy(): AVLTree<K, V>;
    /** Check if tree contains a node with the given key */
    contains(key: K): boolean;
    /**
     * Execute `callback` on every node of the tree, in order.
     * Return a 'truthy' value from `callback` to stop the iteration.
     */
    forEach(callback: ForEachCallback<K, V>): AVLTree<K, V>;
    /** Walk key range from `low` to `high`. Stop if `fn` returns a value. */
    range(low: K, high: K, fn: TraverseCallback<K, V>, ctx?: unknown): AVLTree<K, V>;
    /** Array of all keys, in order */
    keys(): Array<K>;
    /** Array of `data` field values of all nodes, in order */
    values(): Array<V>;
    /** Return node at given `index` */
    at(index: number): Node<K, V> | undefined;
    /** Return node with the minimum key */
    minNode(): Node<K, V> | undefined;
    /** Return node with the maximum key */
    maxNode(): Node<K, V> | undefined;
    /** Return the minimum key */
    min(): K | undefined;
    /** Return the maximum key */
    max(): K | undefined;
    /** Return true if tree is empty */
    isEmpty(): boolean;
    /** Remove (and return) the node with minimum key */
    pop(): BareNode<K, V> | undefined;
    /** Remove (and return) the node with maximum key */
    popMax(): BareNode<K, V> | undefined;
    /** Find node by key */
    find(key: K): Node<K, V> | undefined;
    /** Insert a node into the tree */
    insert(key: K, data?: V): Node<K, V> | undefined;
    /** Remove the node from the tree. */
    remove(key: K | undefined): K | undefined;
    /** Bulk-load items (into an empty tree only) */
    load(keys?: Array<K>, values?: Array<V>, presort?: boolean): this;
    /** A tree is 'balanced' if none of the subtrees differ in height by more than 1 */
    isBalanced(): boolean;
    /** String representation of the tree - primitive horizontal print-out */
    toString(printNode?: (node: Node<K, V>) => string): string;
    /** Successor node */
    static next<K = unknown, V = unknown>(node: Node<K, V>): Node<K, V> | undefined;
    /** Predecessor node */
    static prev<K = unknown, V = unknown>(node: Node<K, V>): Node<K, V> | undefined;
}
export default AVLTree;
