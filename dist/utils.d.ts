import { Node, PrintCallback } from './types';
/** Default comparison function */
export declare function DEFAULT_COMPARE<K = unknown>(a: K, b: K): number;
/** Single left rotation */
export declare function rotateLeft<K = unknown, V = unknown>(node: Node<K, V>): Node<K, V> | undefined;
export declare function rotateRight<K = unknown, V = unknown>(node: Node<K, V>): Node<K, V> | undefined;
/** Print tree horizontally */
export declare function print<K = unknown, V = unknown>(root: Node<K, V> | undefined, printNode?: PrintCallback<K, V>): string;
/**
 * Is the tree balanced (none of the subtrees differ in height by more than 1)
 */
export declare function isBalanced<K = unknown, V = unknown>(root: Node<K, V> | undefined): boolean;
export declare function loadRecursive<K = unknown, V = unknown>(parent: Node<K, V> | undefined, keys: K[], values: V[], start: number, end: number): Node<K, V> | undefined;
export declare function markBalance<K = unknown, V = unknown>(node: Node<K, V> | undefined): number;
export declare function sort<K = unknown, V = unknown>(keys: Array<K>, values: Array<V>, left: number, right: number, compare: (a: K, b: K) => number): void;
