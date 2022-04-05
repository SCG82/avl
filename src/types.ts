export type Node<K, V> = {
    parent?: Node<K, V>
    left?: Node<K, V>
    right?: Node<K, V>
    balanceFactor: number
    key: K
    value?: V
}
export type BareNode<K, V> = Pick<Node<K, V>, 'key' | 'value'>
export type Comparator<K> = (a: K, b: K) => number
export type ForEachCallback<K, V> = (
    node: Node<K, V>,
    index: number,
) => void | boolean | number | object
export type TraverseCallback<K, V> = (node: Node<K, V>) => void | boolean
export type PrintCallback<K, V> = (node: Node<K, V>) => string
