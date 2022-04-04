import { DEFAULT_COMPARE, isBalanced, loadRecursive, markBalance, print, rotateLeft, rotateRight, sort, } from './utils';
class AVLTree {
    constructor(comparator, noDuplicates = false) {
        this._size = 0;
        this._comparator = comparator || DEFAULT_COMPARE;
        this._noDuplicates = !!noDuplicates;
    }
    /** Number of nodes */
    get size() {
        return this._size;
    }
    /** Clear the tree */
    clear() {
        delete this._root;
        this._size = 0;
        return this;
    }
    /** Clear the tree (alias for `clear`) */
    destroy() {
        return this.clear();
    }
    /** Check if tree contains a node with the given key */
    contains(key) {
        if (this._root) {
            let node = this._root;
            const comparator = this._comparator;
            while (node) {
                const cmp = comparator(key, node.key);
                if (cmp === 0)
                    return true;
                else if (cmp < 0)
                    node = node.left;
                else
                    node = node.right;
            }
        }
        return false;
    }
    /**
     * Execute `callback` on every node of the tree, in order.
     * Return a 'truthy' value from `callback` to stop the iteration.
     */
    forEach(callback) {
        let current = this._root;
        const s = [];
        let done = false;
        let i = 0;
        while (!done) {
            // Reach the left most Node of the current Node
            if (current) {
                // Place pointer to a tree node on the stack
                // before traversing the node's left subtree
                s.push(current);
                current = current.left;
            }
            else {
                // Backtrack from the empty subtree and visit the Node
                // at the top of the stack; however, if the stack is
                // empty you are done
                if (s.length > 0) {
                    current = s.pop();
                    done = !!callback(current, i++);
                    // We have visited the node and its left
                    // subtree. Now, it is the right subtree's turn
                    current = current.right;
                }
                else {
                    done = true;
                }
            }
        }
        return this;
    }
    /** Walk key range from `low` to `high`. Stop if `fn` returns a value. */
    range(low, high, fn, ctx) {
        const Q = [];
        const compare = this._comparator;
        let node = this._root;
        let cmp;
        while (Q.length !== 0 || node) {
            if (node) {
                Q.push(node);
                node = node.left;
            }
            else {
                node = Q.pop();
                cmp = compare(node.key, high);
                if (cmp > 0) {
                    break;
                }
                else if (compare(node.key, low) >= 0) {
                    if (fn.call(ctx, node)) {
                        // stop if something is returned
                        return this;
                    }
                }
                node = node.right;
            }
        }
        return this;
    }
    /** Array of all keys, in order */
    keys() {
        const r = [];
        this.forEach((node) => {
            r.push(node.key);
        });
        return r;
    }
    /** Array of `data` field values of all nodes, in order */
    values() {
        const r = [];
        this.forEach((node) => {
            r.push(node.data);
        });
        return r;
    }
    /** Return node at given `index` */
    at(index) {
        let r;
        this.forEach((node, i) => {
            if (i === index)
                return (r = node);
        });
        return r;
    }
    /** Return node with the minimum key */
    minNode() {
        let node = this._root;
        if (!node)
            return;
        while (node.left) {
            node = node.left;
        }
        return node;
    }
    /** Return node with the maximum key */
    maxNode() {
        let node = this._root;
        if (!node)
            return;
        while (node.right) {
            node = node.right;
        }
        return node;
    }
    /** Return the minimum key */
    min() {
        const node = this.minNode();
        if (!node)
            return;
        return node.key;
    }
    /** Return the maximum key */
    max() {
        const node = this.maxNode();
        if (!node)
            return;
        return node.key;
    }
    /** Return true if tree is empty */
    isEmpty() {
        return !this._root;
    }
    /** Remove (and return) the node with minimum key */
    pop() {
        let node = this._root;
        let returnValue;
        if (node) {
            while (node.left) {
                node = node.left;
            }
            returnValue = { key: node.key, data: node.data };
            this.remove(node.key);
        }
        return returnValue;
    }
    /** Remove (and return) the node with maximum key */
    popMax() {
        let node = this._root;
        let returnValue;
        if (node) {
            while (node.right) {
                node = node.right;
            }
            returnValue = { key: node.key, data: node.data };
            this.remove(node.key);
        }
        return returnValue;
    }
    /** Find node by key */
    find(key) {
        let subtree = this._root;
        let cmp;
        const compare = this._comparator;
        while (subtree) {
            cmp = compare(key, subtree.key);
            if (cmp === 0)
                return subtree;
            else if (cmp < 0)
                subtree = subtree.left;
            else
                subtree = subtree.right;
        }
    }
    /** Insert a node into the tree */
    insert(key, data) {
        var _a, _b;
        if (!this._root) {
            this._root = {
                parent: undefined,
                left: undefined,
                right: undefined,
                balanceFactor: 0,
                key,
                data,
            };
            this._size++;
            return this._root;
        }
        const compare = this._comparator;
        let node = this._root;
        let parent = this._root;
        let cmp = 0;
        if (this._noDuplicates) {
            while (node) {
                cmp = compare(key, node.key);
                parent = node;
                if (cmp === 0)
                    return;
                else if (cmp < 0)
                    node = node.left;
                else
                    node = node.right;
            }
        }
        else {
            while (node) {
                cmp = compare(key, node.key);
                parent = node;
                if (cmp <= 0)
                    node = node.left;
                else
                    node = node.right;
            }
        }
        const newNode = {
            left: undefined,
            right: undefined,
            balanceFactor: 0,
            parent,
            key,
            data,
        };
        let newRoot;
        if (cmp <= 0)
            parent.left = newNode;
        else
            parent.right = newNode;
        while (parent) {
            cmp = compare(parent.key, key);
            if (cmp < 0)
                parent.balanceFactor -= 1;
            else
                parent.balanceFactor += 1;
            if (parent.balanceFactor === 0) {
                break;
            }
            else if (parent.balanceFactor < -1) {
                if (((_a = parent.right) === null || _a === void 0 ? void 0 : _a.balanceFactor) === 1) {
                    rotateRight(parent.right);
                }
                newRoot = rotateLeft(parent);
                if (parent === this._root) {
                    this._root = newRoot;
                }
                break;
            }
            else if (parent.balanceFactor > 1) {
                if (((_b = parent.left) === null || _b === void 0 ? void 0 : _b.balanceFactor) === -1) {
                    rotateLeft(parent.left);
                }
                newRoot = rotateRight(parent);
                if (parent === this._root) {
                    this._root = newRoot;
                }
                break;
            }
            parent = parent.parent;
        }
        this._size++;
        return newNode;
    }
    /** Remove the node from the tree. */
    remove(key) {
        var _a, _b;
        if (!this._root || !key)
            return;
        let node = this._root;
        const compare = this._comparator;
        let cmp = 0;
        // Start at the root, advance down the tree checking for a match.
        while (node) {
            cmp = compare(key, node.key);
            if (cmp === 0)
                break;
            // found it!
            else if (cmp < 0)
                node = node.left;
            else
                node = node.right;
        }
        // If we reached the end of the tree, the key is not in the tree.
        if (!node)
            return;
        const returnValue = node.key;
        let max;
        let min;
        if (node.left) {
            max = node.left;
            while (max.left || max.right) {
                while (max.right) {
                    max = max.right;
                }
                node.key = max.key;
                node.data = max.data;
                if (max.left) {
                    node = max;
                    max = max.left;
                }
            }
            node.key = max.key;
            node.data = max.data;
            node = max;
        }
        if (node.right) {
            min = node.right;
            while (min.left || min.right) {
                while (min.left) {
                    min = min.left;
                }
                node.key = min.key;
                node.data = min.data;
                if (min.right) {
                    node = min;
                    min = min.right;
                }
            }
            node.key = min.key;
            node.data = min.data;
            node = min;
        }
        let parent = node.parent;
        let pp = node;
        let newRoot;
        while (parent) {
            if (parent.left === pp)
                parent.balanceFactor -= 1;
            else
                parent.balanceFactor += 1;
            if (parent.balanceFactor < -1) {
                if (((_a = parent.right) === null || _a === void 0 ? void 0 : _a.balanceFactor) === 1) {
                    rotateRight(parent.right);
                }
                newRoot = rotateLeft(parent);
                if (parent === this._root) {
                    this._root = newRoot;
                }
                parent = newRoot;
            }
            else if (parent.balanceFactor > 1) {
                if (((_b = parent.left) === null || _b === void 0 ? void 0 : _b.balanceFactor) === -1) {
                    rotateLeft(parent.left);
                }
                newRoot = rotateRight(parent);
                if (parent === this._root) {
                    this._root = newRoot;
                }
                parent = newRoot;
            }
            if ((parent === null || parent === void 0 ? void 0 : parent.balanceFactor) === -1 || (parent === null || parent === void 0 ? void 0 : parent.balanceFactor) === 1) {
                break;
            }
            pp = parent;
            parent = parent === null || parent === void 0 ? void 0 : parent.parent;
        }
        if (node.parent) {
            if (node.parent.left === node) {
                delete node.parent.left;
            }
            else {
                delete node.parent.right;
            }
        }
        if (node === this._root) {
            delete this._root;
        }
        this._size--;
        return returnValue;
    }
    /** Bulk-load items (into an empty tree only) */
    load(keys = [], values = [], presort) {
        if (this._size !== 0)
            throw new Error('bulk-load: tree is not empty');
        const size = keys.length;
        if (presort)
            sort(keys, values, 0, size - 1, this._comparator);
        this._root = loadRecursive(undefined, keys, values, 0, size);
        markBalance(this._root);
        this._size = size;
        return this;
    }
    /** A tree is 'balanced' if none of the subtrees differ in height by more than 1 */
    isBalanced() {
        return isBalanced(this._root);
    }
    /** String representation of the tree - primitive horizontal print-out */
    toString(printNode) {
        return print(this._root, printNode);
    }
    /** Successor node */
    static next(node) {
        let successor = node;
        if (successor) {
            if (successor.right) {
                successor = successor.right;
                while (successor.left)
                    successor = successor.left;
            }
            else {
                successor = node.parent;
                while (successor && successor.right === node) {
                    node = successor;
                    successor = successor.parent;
                }
            }
        }
        return successor;
    }
    /** Predecessor node */
    static prev(node) {
        let predecessor = node;
        if (predecessor) {
            if (predecessor.left) {
                predecessor = predecessor.left;
                while (predecessor.right)
                    predecessor = predecessor.right;
            }
            else {
                predecessor = node.parent;
                while (predecessor && predecessor.left === node) {
                    node = predecessor;
                    predecessor = predecessor.parent;
                }
            }
        }
        return predecessor;
    }
}
export default AVLTree;
//# sourceMappingURL=index.js.map