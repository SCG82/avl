export type Node<Key, Value> = {
    parent?:       Node<Key, Value>,
    left?:         Node<Key, Value>,
    right?:        Node<Key, Value>,
    balanceFactor: number,
    key?:          Key,
    data?:         Value
}
export type BareNode<Key = unknown, Value = unknown> = Pick<Node<Key, Value>, 'key' | 'data'>
export type Comparator<Key> = (a: Key | undefined, b: Key | undefined) => number
export type ForEachCallback<Key, Value> = (node: Node<Key, Value>, index: number) => void | boolean | number | object
export type TraverseCallback<Key, Value> = (node: Node<Key, Value>) => (void | boolean)
export type PrintCallback<Key, Value> = (node: Node<Key, Value>) => string
