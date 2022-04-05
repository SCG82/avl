import { Node, PrintCallback } from './types'

/** Default comparison function */
export function DEFAULT_COMPARE<K = unknown>(a: K, b: K): number {
    return a > b ? 1 : a < b ? -1 : 0
}

/** Single left rotation */
export function rotateLeft<K = unknown, V = unknown>(
    node: Node<K, V>,
): Node<K, V> | undefined {
    const rightNode = node.right
    if (!rightNode) return
    node.right = rightNode.left

    if (rightNode.left) rightNode.left.parent = node

    rightNode.parent = node.parent
    if (rightNode.parent) {
        if (rightNode.parent.left === node) {
            rightNode.parent.left = rightNode
        } else {
            rightNode.parent.right = rightNode
        }
    }

    node.parent = rightNode
    rightNode.left = node

    node.balanceFactor += 1
    if (rightNode.balanceFactor < 0) {
        node.balanceFactor -= rightNode.balanceFactor
    }

    rightNode.balanceFactor += 1
    if (node.balanceFactor > 0) {
        rightNode.balanceFactor += node.balanceFactor
    }
    return rightNode
}

export function rotateRight<K = unknown, V = unknown>(
    node: Node<K, V>,
): Node<K, V> | undefined {
    const leftNode = node.left
    if (!leftNode) return
    node.left = leftNode.right
    if (node.left) node.left.parent = node

    leftNode.parent = node.parent
    if (leftNode.parent) {
        if (leftNode.parent.left === node) {
            leftNode.parent.left = leftNode
        } else {
            leftNode.parent.right = leftNode
        }
    }

    node.parent = leftNode
    leftNode.right = node

    node.balanceFactor -= 1
    if (leftNode.balanceFactor > 0) {
        node.balanceFactor -= leftNode.balanceFactor
    }

    leftNode.balanceFactor -= 1
    if (node.balanceFactor < 0) {
        leftNode.balanceFactor += node.balanceFactor
    }

    return leftNode
}

/** Print tree horizontally */
export function print<K = unknown, V = unknown>(
    root: Node<K, V> | undefined,
    printNode: PrintCallback<K, V> = (node: Node<K, V>) => String(node.key),
): string {
    const out: Array<string> = []
    row(root, '', true, (v) => out.push(v), printNode)
    return out.join('')
}

/** Print level of the tree */
function row<K = unknown, V = unknown>(
    root: Node<K, V> | undefined,
    prefix: string,
    isTail: boolean,
    out: (xin: string) => void,
    printNode: PrintCallback<K, V>,
) {
    if (root) {
        out(`${prefix}${isTail ? '└── ' : '├── '}${printNode(root)}\n`)
        const indent = prefix + (isTail ? '    ' : '│   ')
        if (root.left) row(root.left, indent, false, out, printNode)
        if (root.right) row(root.right, indent, true, out, printNode)
    }
}

/**
 * Is the tree balanced (none of the subtrees differ in height by more than 1)
 */
export function isBalanced<K = unknown, V = unknown>(
    root: Node<K, V> | undefined,
): boolean {
    if (!root) return true // If node is empty then return true

    // Get the height of left and right sub trees
    const lh = height(root.left)
    const rh = height(root.right)

    if (
        Math.abs(lh - rh) <= 1 &&
        isBalanced(root.left) &&
        isBalanced(root.right)
    ) {
        return true
    }

    // If we reach here then tree is not height-balanced
    return false
}

/**
 * Compute the 'height' of a tree.
 * Height is the number of nodes along the longest path
 * from the root node down to the farthest leaf node.
 */
function height<K = unknown, V = unknown>(
    node: Node<K, V> | undefined,
): number {
    return node ? 1 + Math.max(height(node.left), height(node.right)) : 0
}

export function loadRecursive<K = unknown, V = unknown>(
    parent: Node<K, V> | undefined,
    keys: K[],
    values: V[],
    start: number,
    end: number,
) {
    const size = end - start
    if (size > 0) {
        const middle = start + Math.floor(size / 2)
        const key = keys[middle]
        const value = values[middle]
        const node: Node<K, V> = { key, value, parent, balanceFactor: 0 }
        node.left = loadRecursive(node, keys, values, start, middle)
        node.right = loadRecursive(node, keys, values, middle + 1, end)
        return node
    }
}

export function markBalance<K = unknown, V = unknown>(
    node: Node<K, V> | undefined,
): number {
    if (!node) return 0
    const lh = markBalance(node.left)
    const rh = markBalance(node.right)

    node.balanceFactor = lh - rh
    return Math.max(lh, rh) + 1
}

export function sort<K = unknown, V = unknown>(
    keys: Array<K>,
    values: Array<V>,
    left: number,
    right: number,
    compare: (a: K, b: K) => number,
) {
    if (left >= right) return

    // eslint-disable-next-line no-bitwise
    const pivot = keys[(left + right) >> 1]
    let i = left - 1
    let j = right + 1

    // eslint-disable-next-line no-constant-condition
    while (true) {
        do i++
        while (compare(keys[i], pivot) < 0)
        do j--
        while (compare(keys[j], pivot) > 0)
        if (i >= j) break

        const tmpK: K = keys[i]
        keys[i] = keys[j]
        keys[j] = tmpK

        const tmpV: V = values[i]
        values[i] = values[j]
        values[j] = tmpV
    }

    sort(keys, values, left, j, compare)
    sort(keys, values, j + 1, right, compare)
}
