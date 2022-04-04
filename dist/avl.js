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
        var rightNode = node.right;
        if (!rightNode)
            { return; }
        node.right = rightNode.left;
        if (rightNode.left)
            { rightNode.left.parent = node; }
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
        var leftNode = node.left;
        if (!leftNode)
            { return; }
        node.left = leftNode.right;
        if (node.left)
            { node.left.parent = node; }
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
    function print(root, printNode) {
        if ( printNode === void 0 ) printNode = function (node) { return String(node.key); };

        var out = [];
        row(root, '', true, function (v) { return out.push(v); }, printNode);
        return out.join('');
    }
    /** Print level of the tree */
    function row(root, prefix, isTail, out, printNode) {
        if (root) {
            out(("" + prefix + (isTail ? '└── ' : '├── ') + (printNode(root)) + "\n"));
            var indent = prefix + (isTail ? '    ' : '│   ');
            if (root.left)
                { row(root.left, indent, false, out, printNode); }
            if (root.right)
                { row(root.right, indent, true, out, printNode); }
        }
    }
    /**
     * Is the tree balanced (none of the subtrees differ in height by more than 1)
     */
    function isBalanced(root) {
        if (!root)
            { return true; } // If node is empty then return true
        // Get the height of left and right sub trees
        var lh = height(root.left);
        var rh = height(root.right);
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
        var size = end - start;
        if (size > 0) {
            var middle = start + Math.floor(size / 2);
            var key = keys[middle];
            var data = values[middle];
            var node = { key: key, data: data, parent: parent, balanceFactor: 0 };
            node.left = loadRecursive(node, keys, values, start, middle);
            node.right = loadRecursive(node, keys, values, middle + 1, end);
            return node;
        }
    }
    function markBalance(node) {
        if (!node)
            { return 0; }
        var lh = markBalance(node.left);
        var rh = markBalance(node.right);
        node.balanceFactor = lh - rh;
        return Math.max(lh, rh) + 1;
    }
    function sort(keys, values, left, right, compare) {
        if (left >= right)
            { return; }
        // eslint-disable-next-line no-bitwise
        var pivot = keys[(left + right) >> 1];
        var i = left - 1;
        var j = right + 1;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            do
                { i++; }
            while (compare(keys[i], pivot) < 0);
            do
                { j--; }
            while (compare(keys[j], pivot) > 0);
            if (i >= j)
                { break; }
            var tmpK = keys[i];
            keys[i] = keys[j];
            keys[j] = tmpK;
            var tmpV = values[i];
            values[i] = values[j];
            values[j] = tmpV;
        }
        sort(keys, values, left, j, compare);
        sort(keys, values, j + 1, right, compare);
    }

    var AVLTree = function AVLTree(comparator, noDuplicates) {
        if ( noDuplicates === void 0 ) noDuplicates = false;

        this._size = 0;
        this._comparator = comparator || DEFAULT_COMPARE;
        this._noDuplicates = !!noDuplicates;
    };

    var prototypeAccessors = { size: { configurable: true } };
    /** Number of nodes */
    prototypeAccessors.size.get = function () {
        return this._size;
    };
    /** Clear the tree */
    AVLTree.prototype.clear = function clear () {
        delete this._root;
        this._size = 0;
        return this;
    };
    /** Clear the tree (alias for `clear`) */
    AVLTree.prototype.destroy = function destroy () {
        return this.clear();
    };
    /** Check if tree contains a node with the given key */
    AVLTree.prototype.contains = function contains (key) {
        if (this._root) {
            var node = this._root;
            var comparator = this._comparator;
            while (node) {
                var cmp = comparator(key, node.key);
                if (cmp === 0)
                    { return true; }
                else if (cmp < 0)
                    { node = node.left; }
                else
                    { node = node.right; }
            }
        }
        return false;
    };
    /**
     * Execute `callback` on every node of the tree, in order.
     * Return a 'truthy' value from `callback` to stop the iteration.
     */
    AVLTree.prototype.forEach = function forEach (callback) {
        var current = this._root;
        var s = [];
        var done = false;
        var i = 0;
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
    };
    /** Walk key range from `low` to `high`. Stop if `fn` returns a value. */
    AVLTree.prototype.range = function range (low, high, fn, ctx) {
        var Q = [];
        var compare = this._comparator;
        var node = this._root;
        var cmp;
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
    };
    /** Array of all keys, in order */
    AVLTree.prototype.keys = function keys () {
        var r = [];
        this.forEach(function (node) {
            r.push(node.key);
        });
        return r;
    };
    /** Array of `data` field values of all nodes, in order */
    AVLTree.prototype.values = function values () {
        var r = [];
        this.forEach(function (node) {
            r.push(node.data);
        });
        return r;
    };
    /** Return node at given `index` */
    AVLTree.prototype.at = function at (index) {
        var r;
        this.forEach(function (node, i) {
            if (i === index)
                { return (r = node); }
        });
        return r;
    };
    /** Return node with the minimum key */
    AVLTree.prototype.minNode = function minNode () {
        var node = this._root;
        if (!node)
            { return; }
        while (node.left) {
            node = node.left;
        }
        return node;
    };
    /** Return node with the maximum key */
    AVLTree.prototype.maxNode = function maxNode () {
        var node = this._root;
        if (!node)
            { return; }
        while (node.right) {
            node = node.right;
        }
        return node;
    };
    /** Return the minimum key */
    AVLTree.prototype.min = function min () {
        var node = this.minNode();
        if (!node)
            { return; }
        return node.key;
    };
    /** Return the maximum key */
    AVLTree.prototype.max = function max () {
        var node = this.maxNode();
        if (!node)
            { return; }
        return node.key;
    };
    /** Return true if tree is empty */
    AVLTree.prototype.isEmpty = function isEmpty () {
        return !this._root;
    };
    /** Remove (and return) the node with minimum key */
    AVLTree.prototype.pop = function pop () {
        var node = this._root;
        var returnValue;
        if (node) {
            while (node.left) {
                node = node.left;
            }
            returnValue = { key: node.key, data: node.data };
            this.remove(node.key);
        }
        return returnValue;
    };
    /** Remove (and return) the node with maximum key */
    AVLTree.prototype.popMax = function popMax () {
        var node = this._root;
        var returnValue;
        if (node) {
            while (node.right) {
                node = node.right;
            }
            returnValue = { key: node.key, data: node.data };
            this.remove(node.key);
        }
        return returnValue;
    };
    /** Find node by key */
    AVLTree.prototype.find = function find (key) {
        var subtree = this._root;
        var cmp;
        var compare = this._comparator;
        while (subtree) {
            cmp = compare(key, subtree.key);
            if (cmp === 0)
                { return subtree; }
            else if (cmp < 0)
                { subtree = subtree.left; }
            else
                { subtree = subtree.right; }
        }
    };
    /** Insert a node into the tree */
    AVLTree.prototype.insert = function insert (key, data) {
        var _a, _b;
        if (!this._root) {
            this._root = {
                parent: undefined,
                left: undefined,
                right: undefined,
                balanceFactor: 0,
                key: key,
                data: data,
            };
            this._size++;
            return this._root;
        }
        var compare = this._comparator;
        var node = this._root;
        var parent = this._root;
        var cmp = 0;
        if (this._noDuplicates) {
            while (node) {
                cmp = compare(key, node.key);
                parent = node;
                if (cmp === 0)
                    { return; }
                else if (cmp < 0)
                    { node = node.left; }
                else
                    { node = node.right; }
            }
        }
        else {
            while (node) {
                cmp = compare(key, node.key);
                parent = node;
                if (cmp <= 0)
                    { node = node.left; }
                else
                    { node = node.right; }
            }
        }
        var newNode = {
            left: undefined,
            right: undefined,
            balanceFactor: 0,
            parent: parent,
            key: key,
            data: data,
        };
        var newRoot;
        if (cmp <= 0)
            { parent.left = newNode; }
        else
            { parent.right = newNode; }
        while (parent) {
            cmp = compare(parent.key, key);
            if (cmp < 0)
                { parent.balanceFactor -= 1; }
            else
                { parent.balanceFactor += 1; }
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
    };
    /** Remove the node from the tree. */
    AVLTree.prototype.remove = function remove (key) {
        var _a, _b;
        if (!this._root || !key)
            { return; }
        var node = this._root;
        var compare = this._comparator;
        var cmp = 0;
        // Start at the root, advance down the tree checking for a match.
        while (node) {
            cmp = compare(key, node.key);
            if (cmp === 0)
                { break; }
            // found it!
            else if (cmp < 0)
                { node = node.left; }
            else
                { node = node.right; }
        }
        // If we reached the end of the tree, the key is not in the tree.
        if (!node)
            { return; }
        var returnValue = node.key;
        var max;
        var min;
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
        var parent = node.parent;
        var pp = node;
        var newRoot;
        while (parent) {
            if (parent.left === pp)
                { parent.balanceFactor -= 1; }
            else
                { parent.balanceFactor += 1; }
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
    };
    /** Bulk-load items (into an empty tree only) */
    AVLTree.prototype.load = function load (keys, values, presort) {
            if ( keys === void 0 ) keys = [];
            if ( values === void 0 ) values = [];

        if (this._size !== 0)
            { throw new Error('bulk-load: tree is not empty'); }
        var size = keys.length;
        if (presort)
            { sort(keys, values, 0, size - 1, this._comparator); }
        this._root = loadRecursive(undefined, keys, values, 0, size);
        markBalance(this._root);
        this._size = size;
        return this;
    };
    /** A tree is 'balanced' if none of the subtrees differ in height by more than 1 */
    AVLTree.prototype.isBalanced = function isBalanced$1 () {
        return isBalanced(this._root);
    };
    /** String representation of the tree - primitive horizontal print-out */
    AVLTree.prototype.toString = function toString (printNode) {
        return print(this._root, printNode);
    };
    /** Successor node */
    AVLTree.next = function next (node) {
        var successor = node;
        if (successor) {
            if (successor.right) {
                successor = successor.right;
                while (successor.left)
                    { successor = successor.left; }
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
    };
    /** Predecessor node */
    AVLTree.prev = function prev (node) {
        var predecessor = node;
        if (predecessor) {
            if (predecessor.left) {
                predecessor = predecessor.left;
                while (predecessor.right)
                    { predecessor = predecessor.right; }
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
    };

    Object.defineProperties( AVLTree.prototype, prototypeAccessors );

    return AVLTree;

})));
//# sourceMappingURL=avl.js.map
