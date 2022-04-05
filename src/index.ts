import {
    BareNode,
    Comparator,
    ForEachCallback,
    Node,
    TraverseCallback,
} from './types'
import {
    DEFAULT_COMPARE,
    isBalanced,
    loadRecursive,
    markBalance,
    print,
    rotateLeft,
    rotateRight,
    sort,
} from './utils'

/**
 * Implements a Adelson-Velsky-Landis (AVL) tree, a self-balancing binary tree.
 * Lookup, insertion, and deletion all take O(log n) time in both the average
 * and worst cases, where n is the number of nodes in the tree prior to the
 * operation.
 */
class AVLTree<K, V> {
    private readonly _comparator: Comparator<K>
    private _root?: Node<K, V>
    private _size = 0
    private _noDuplicates: boolean

    constructor(comparator?: Comparator<K>, noDuplicates = false) {
        this._comparator = comparator || DEFAULT_COMPARE
        this._noDuplicates = !!noDuplicates
    }

    /** Number of nodes */
    get size(): number {
        return this._size
    }

    /** Clears the tree */
    clear(): this {
        delete this._root
        this._size = 0
        return this
    }

    /** Clears the tree (alias for `clear`) */
    destroy(): AVLTree<K, V> {
        return this.clear()
    }

    /** Check if tree contains a node with the given key */
    has(key: K): boolean {
        if (this._root) {
            let node: Node<K, V> | undefined = this._root
            const comparator = this._comparator
            while (node) {
                const cmp = comparator(key, node.key)
                if (cmp === 0) return true
                else if (cmp < 0) node = node.left
                else node = node.right
            }
        }
        return false
    }

    /**
     * Executes a callback for each node in order.
     * Return a 'truthy' value from `callback` to stop the iteration.
     *
     * **Note: Make sure the callback does not unintentionally return a truthy value!**
     */
    forEach(callback: ForEachCallback<K, V>): this {
        let node = this._root
        const s: Array<Node<K, V>> = []
        let done: boolean | undefined = false
        let i = 0
        while (!done) {
            // First, traverse the left subtree, storing a pointer to each node
            // in the stack, until reaching the leftmost node.
            // Then, backtrack from the empty subtree and traverse the right subtree
            // of the node at the top of the stack. Continue until the stack is empty.
            if (node) {
                s.push(node)
                node = node.left
            } else {
                if (s.length > 0) {
                    node = s.pop() as Node<K, V>
                    done = !!callback(node, i++)
                    node = node.right
                } else {
                    done = true
                }
            }
        }
        return this
    }

    /** Walks key range from `low` to `high`. Stop if `fn` returns a value. */
    range(low: K, high: K, fn: TraverseCallback<K, V>, ctx?: unknown): this {
        const Q: Array<Node<K, V>> = []
        const compare = this._comparator
        let node = this._root
        let cmp: number
        while (Q.length !== 0 || node) {
            if (node) {
                Q.push(node)
                node = node.left
            } else {
                node = Q.pop() as Node<K, V>
                cmp = compare(node.key, high)
                if (cmp > 0) {
                    break
                } else if (compare(node.key, low) >= 0) {
                    if (fn.call(ctx, node)) {
                        // stop if something is returned
                        return this
                    }
                }
                node = node.right
            }
        }
        return this
    }

    /** Returns all keys, in order */
    *keys(): IterableIterator<K> {
        let node = this._root
        const s: Array<Node<K, V>> = []
        let done = false
        while (!done) {
            if (node) {
                s.push(node)
                node = node.left
            } else {
                if (s.length > 0) {
                    node = s.pop() as Node<K, V>
                    yield node.key
                    node = node.right
                } else {
                    done = true
                }
            }
        }
    }

    /** Returns all values, in order */
    *values(): IterableIterator<V | undefined> {
        let node = this._root
        const s: Array<Node<K, V>> = []
        let done = false
        while (!done) {
            if (node) {
                s.push(node)
                node = node.left
            } else {
                if (s.length > 0) {
                    node = s.pop() as Node<K, V>
                    yield node.value
                    node = node.right
                } else {
                    done = true
                }
            }
        }
    }

    /** Returns all [key, value] entries, in order */
    *entries(): IterableIterator<[K, V | undefined]> {
        let node = this._root
        const s: Array<Node<K, V>> = []
        let done = false
        while (!done) {
            if (node) {
                s.push(node)
                node = node.left
            } else {
                if (s.length > 0) {
                    node = s.pop() as Node<K, V>
                    yield [node.key, node.value]
                    node = node.right
                } else {
                    done = true
                }
            }
        }
    }

    /** Returns node at given `index` */
    at(index: number): Node<K, V> | undefined {
        let r: Node<K, V> | undefined
        this.forEach((node, i) => {
            if (i === index) return (r = node)
        })
        return r
    }

    /** Returns node with the minimum key */
    minNode(): Node<K, V> | undefined {
        let node = this._root
        if (!node) return
        while (node.left) {
            node = node.left
        }
        return node
    }

    /** Returns node with the maximum key */
    maxNode(): Node<K, V> | undefined {
        let node = this._root
        if (!node) return
        while (node.right) {
            node = node.right
        }
        return node
    }

    /** Returns the minimum key */
    min(): K | undefined {
        const node = this.minNode()
        if (!node) return
        return node.key
    }

    /** Returns the maximum key */
    max(): K | undefined {
        const node = this.maxNode()
        if (!node) return
        return node.key
    }

    /** Returns true if tree is empty */
    isEmpty(): boolean {
        return !this._root
    }

    /** Removes (and returns) the entry with minimum key */
    shift(): BareNode<K, V> | undefined {
        let node = this._root
        let returnValue: BareNode<K, V> | undefined
        if (node) {
            while (node.left) {
                node = node.left
            }
            returnValue = { key: node.key, value: node.value }
            this.delete(node.key)
        }
        return returnValue
    }

    /** Removes (and returns) the entry with maximum key */
    pop(): BareNode<K, V> | undefined {
        let node = this._root
        let returnValue: BareNode<K, V> | undefined
        if (node) {
            while (node.right) {
                node = node.right
            }
            returnValue = { key: node.key, value: node.value }
            this.delete(node.key)
        }
        return returnValue
    }

    /** Search for an entry by key */
    get(key: K): V | undefined {
        const compare = this._comparator
        let node = this._root
        while (node) {
            const cmp = compare(key, node.key)
            if (cmp === 0) return node.value
            else if (cmp < 0) node = node.left
            else node = node.right
        }
    }

    /** Insert a new key/value pair into the tree or update an existing entry */
    set(key: K, value?: V): this {
        if (!this._root) {
            this._root = {
                parent: undefined,
                left: undefined,
                right: undefined,
                balanceFactor: 0,
                key,
                value,
            }
            this._size++
            return this
        }

        const compare = this._comparator
        let node: Node<K, V> | undefined = this._root
        let parent: Node<K, V> | undefined
        let cmp = 0

        if (this._noDuplicates) {
            while (node) {
                cmp = compare(key, node.key)
                parent = node
                if (cmp === 0) {
                    node.value = value
                    return this
                } else if (cmp < 0) {
                    node = node.left
                } else {
                    node = node.right
                }
            }
        } else {
            while (node) {
                cmp = compare(key, node.key)
                parent = node
                if (cmp <= 0) node = node.left
                else node = node.right
            }
        }

        if (parent == undefined) {
            throw new Error(`failed to find parent node for insert`)
        }

        const newNode: Node<K, V> = {
            left: undefined,
            right: undefined,
            balanceFactor: 0,
            parent,
            key,
            value,
        }

        if (cmp <= 0) parent.left = newNode
        else parent.right = newNode

        let newRoot: Node<K, V> | undefined

        while (parent) {
            cmp = compare(parent.key, key)
            if (cmp < 0) parent.balanceFactor -= 1
            else parent.balanceFactor += 1

            if (parent.balanceFactor === 0) {
                break
            } else if (parent.balanceFactor < -1) {
                if (parent.right?.balanceFactor === 1) {
                    rotateRight(parent.right)
                }
                newRoot = rotateLeft(parent)
                if (parent === this._root) {
                    this._root = newRoot
                }
                break
            } else if (parent.balanceFactor > 1) {
                if (parent.left?.balanceFactor === -1) {
                    rotateLeft(parent.left)
                }
                newRoot = rotateRight(parent)
                if (parent === this._root) {
                    this._root = newRoot
                }
                break
            }
            parent = parent.parent
        }

        this._size++
        return this
    }

    /** Insert a new key/value pair into the tree or update an existing entry (alias for `set`) */
    insert(key: K, value?: V): this {
        return this.set(key, value)
    }

    /** Finds the first matching node by key and removes it. Returns true if successful. */
    delete(key: K | undefined): boolean {
        if (!this._root || !key) return false

        let node: Node<K, V> | undefined = this._root
        const compare = this._comparator
        let cmp = 0

        // Start at the root, advance down the tree checking for a match.
        while (node) {
            cmp = compare(key, node.key)
            // found it!
            if (cmp === 0) break
            else if (cmp < 0) node = node.left
            else node = node.right
        }
        // If we reached the end of the tree, the key is not in the tree.
        if (!node) return false

        let max: Node<K, V>
        let min: Node<K, V>

        if (node.left) {
            max = node.left

            while (max.left || max.right) {
                while (max.right) {
                    max = max.right
                }
                node.key = max.key
                node.value = max.value
                if (max.left) {
                    node = max
                    max = max.left
                }
            }

            node.key = max.key
            node.value = max.value
            node = max
        }

        if (node.right) {
            min = node.right

            while (min.left || min.right) {
                while (min.left) {
                    min = min.left
                }
                node.key = min.key
                node.value = min.value
                if (min.right) {
                    node = min
                    min = min.right
                }
            }

            node.key = min.key
            node.value = min.value
            node = min
        }

        let parent: Node<K, V> | undefined = node.parent
        let pp: Node<K, V> | undefined = node
        let newRoot: Node<K, V> | undefined

        while (parent) {
            if (parent.left === pp) parent.balanceFactor -= 1
            else parent.balanceFactor += 1

            if (parent.balanceFactor < -1) {
                if (parent.right?.balanceFactor === 1) {
                    rotateRight(parent.right)
                }
                newRoot = rotateLeft(parent)
                if (parent === this._root) {
                    this._root = newRoot
                }
                parent = newRoot
            } else if (parent.balanceFactor > 1) {
                if (parent.left?.balanceFactor === -1) {
                    rotateLeft(parent.left)
                }
                newRoot = rotateRight(parent)
                if (parent === this._root) {
                    this._root = newRoot
                }
                parent = newRoot
            }

            if (parent?.balanceFactor === -1 || parent?.balanceFactor === 1) {
                break
            }
            pp = parent
            parent = parent?.parent
        }

        if (node.parent) {
            if (node.parent.left === node) {
                delete node.parent.left
            } else {
                delete node.parent.right
            }
        }

        if (node === this._root) {
            delete this._root
        }

        this._size--
        return true
    }

    /** Bulk-load items (into an empty tree only) */
    load(keys: Array<K> = [], values: Array<V> = [], presort?: boolean) {
        if (this._size !== 0) throw new Error('bulk-load: tree is not empty')
        const size = keys.length
        if (presort) sort(keys, values, 0, size - 1, this._comparator)
        this._root = loadRecursive(undefined, keys, values, 0, size)
        markBalance(this._root)
        this._size = size
        return this
    }

    /** A tree is 'balanced' if none of the subtrees differ in height by more than 1 */
    isBalanced() {
        return isBalanced(this._root)
    }

    /** String representation of the tree - primitive horizontal print-out */
    toString(printNode?: (node: Node<K, V>) => string) {
        return print(this._root, printNode).trim()
    }

    /** Return the node immediately after the given node in the in-order traversal */
    static next<K = unknown, V = unknown>(
        node: Node<K, V>,
    ): Node<K, V> | undefined {
        let successor: Node<K, V> | undefined = node
        if (successor) {
            if (successor.right) {
                successor = successor.right
                while (successor.left) successor = successor.left
            } else {
                successor = node.parent
                while (successor && successor.right === node) {
                    node = successor
                    successor = successor.parent
                }
            }
        }
        return successor
    }

    /** Return the node immediately before the given node in the in-order traversal */
    static prev<K = unknown, V = unknown>(
        node: Node<K, V>,
    ): Node<K, V> | undefined {
        let predecessor: Node<K, V> | undefined = node
        if (predecessor) {
            if (predecessor.left) {
                predecessor = predecessor.left
                while (predecessor.right) predecessor = predecessor.right
            } else {
                predecessor = node.parent
                while (predecessor && predecessor.left === node) {
                    node = predecessor
                    predecessor = predecessor.parent
                }
            }
        }
        return predecessor
    }
}

export default AVLTree
