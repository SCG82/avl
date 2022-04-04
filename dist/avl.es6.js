/**
 * avl v2.0.0
 * Fast AVL tree for Node and browser
 *
 * @author Alexander Milevski <info@w8r.name>
 * @license MIT
 * @preserve
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.AVLTree = factory());
}(this, (function () { 'use strict';

    /** Default comparison function */
    function DEFAULT_COMPARE(a, b) {
        return a > b ? 1 : a < b ? -1 : 0;
    }
    /** Single left rotation */
    function rotateLeft(node) {
        const rightNode = node.right;
        if (!rightNode)
            return;
        node.right = rightNode.left;
        if (rightNode.left)
            rightNode.left.parent = node;
        rightNode.parent = node.parent;
        if (rightNode.parent) {
            if (rightNode.parent.left === node) {
                rightNode.parent.left = rightNode;
            }
            else {
                rightNode.parent.right = rightNode;
            }
        }
        node.parent = rightNode;
        rightNode.left = node;
        node.balanceFactor += 1;
        if (rightNode.balanceFactor < 0) {
            node.balanceFactor -= rightNode.balanceFactor;
        }
        rightNode.balanceFactor += 1;
        if (node.balanceFactor > 0) {
            rightNode.balanceFactor += node.balanceFactor;
        }
        return rightNode;
    }
    function rotateRight(node) {
        const leftNode = node.left;
        if (!leftNode)
            return;
        node.left = leftNode.right;
        if (node.left)
            node.left.parent = node;
        leftNode.parent = node.parent;
        if (leftNode.parent) {
            if (leftNode.parent.left === node) {
                leftNode.parent.left = leftNode;
            }
            else {
                leftNode.parent.right = leftNode;
            }
        }
        node.parent = leftNode;
        leftNode.right = node;
        node.balanceFactor -= 1;
        if (leftNode.balanceFactor > 0) {
            node.balanceFactor -= leftNode.balanceFactor;
        }
        leftNode.balanceFactor -= 1;
        if (node.balanceFactor < 0) {
            leftNode.balanceFactor += node.balanceFactor;
        }
        return leftNode;
    }
    /** Print tree horizontally */
    function print(root, printNode = (node) => String(node.key)) {
        const out = [];
        row(root, '', true, (v) => out.push(v), printNode);
        return out.join('');
    }
    /** Print level of the tree */
    function row(root, prefix, isTail, out, printNode) {
        if (root) {
            out(`${prefix}${isTail ? '└── ' : '├── '}${printNode(root)}\n`);
            const indent = prefix + (isTail ? '    ' : '│   ');
            if (root.left)
                row(root.left, indent, false, out, printNode);
            if (root.right)
                row(root.right, indent, true, out, printNode);
        }
    }
    /**
     * Is the tree balanced (none of the subtrees differ in height by more than 1)
     */
    function isBalanced(root) {
        if (!root)
            return true; // If node is empty then return true
        // Get the height of left and right sub trees
        const lh = height(root.left);
        const rh = height(root.right);
        if (Math.abs(lh - rh) <= 1 &&
            isBalanced(root.left) &&
            isBalanced(root.right)) {
            return true;
        }
        // If we reach here then tree is not height-balanced
        return false;
    }
    /**
     * Compute the 'height' of a tree.
     * Height is the number of nodes along the longest path
     * from the root node down to the farthest leaf node.
     */
    function height(node) {
        return node ? 1 + Math.max(height(node.left), height(node.right)) : 0;
    }
    function loadRecursive(parent, keys, values, start, end) {
        const size = end - start;
        if (size > 0) {
            const middle = start + Math.floor(size / 2);
            const key = keys[middle];
            const data = values[middle];
            const node = { key, data, parent, balanceFactor: 0 };
            node.left = loadRecursive(node, keys, values, start, middle);
            node.right = loadRecursive(node, keys, values, middle + 1, end);
            return node;
        }
    }
    function markBalance(node) {
        if (!node)
            return 0;
        const lh = markBalance(node.left);
        const rh = markBalance(node.right);
        node.balanceFactor = lh - rh;
        return Math.max(lh, rh) + 1;
    }
    function sort(keys, values, left, right, compare) {
        if (left >= right)
            return;
        // eslint-disable-next-line no-bitwise
        const pivot = keys[(left + right) >> 1];
        let i = left - 1;
        let j = right + 1;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            do
                i++;
            while (compare(keys[i], pivot) < 0);
            do
                j--;
            while (compare(keys[j], pivot) > 0);
            if (i >= j)
                break;
            const tmpK = keys[i];
            keys[i] = keys[j];
            keys[j] = tmpK;
            const tmpV = values[i];
            values[i] = values[j];
            values[j] = tmpV;
        }
        sort(keys, values, left, j, compare);
        sort(keys, values, j + 1, right, compare);
    }

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

    return AVLTree;

})));
//# sourceMappingURL=avl.es6.js.map
