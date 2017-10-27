import * as Types from './types'

export function hasVNodeChanged(nodeA: Types.ValidVNode, nodeB: Types.ValidVNode): boolean {
  const typeHasChanged = typeof nodeA !== typeof nodeB
  const stringHasChanged = typeof nodeA === 'string' && nodeA !== nodeB
  const numberHasChanged = typeof nodeA === 'number' && nodeA !== nodeB
  const vNodeTypeHasChanged = isVNode(nodeA) && isVNode(nodeB) && ((nodeA as Types.VNode).type !== (nodeB as Types.VNode).type)
  return typeHasChanged || stringHasChanged || numberHasChanged || vNodeTypeHasChanged
}

export function isVNode(node: Types.ValidVNode): boolean {
  return isPresent(node) && typeof node !== 'string' && typeof node !== 'number'
}

export function isPresent(node: any): boolean {
  return node !== null && node !== undefined
}

export function getLargestArray<A, B>(a: A[], b: B[]) {
  return a.length > b.length ? a : b
}
