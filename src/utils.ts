import * as Types from './types'

export function hasVNodeChanged(nodeA: Types.ValidVNode, nodeB: Types.ValidVNode): boolean {
  const typeHasChanged = typeof nodeA !== typeof nodeB
  const stringHasChanged = typeof nodeA === 'string' && nodeA !== nodeB
  const numberHasChanged = typeof nodeA === 'number' && nodeA !== nodeB
  const vNodeTypeHasChanged = isVNode(nodeA) && isVNode(nodeB) && ((nodeA as Types.VNode).type !== (nodeB as Types.VNode).type)
  return typeHasChanged || stringHasChanged || numberHasChanged || vNodeTypeHasChanged
}

export function hasComponentChanged(newComponent: Types.ValidVNode, oldComponent: Types.ValidVNode): boolean {
  return shouldComponentRender(newComponent) && isComponent(newComponent) && isComponent(oldComponent)
}

export function isVNode(node: Types.ValidVNode): boolean {
  return isPresent(node) && (node as Types.VNode).type && typeof node !== 'string' && typeof node !== 'number'
}

export function isPresent(node: any): boolean {
  return node !== null && node !== undefined
}

export function isComponent(vNode: Types.ValidVNode) {
  return isPresent(vNode) && !!(vNode as Types.Component<any>).render
}

export function getLargestArray<A, B>(a: A[], b: B[]) {
  return a.length > b.length ? a : b
}

export function lifecycle(
  method: Types.ValidLifecycleMethods,
  vNode: Types.ValidVNode,
  $node?: HTMLElement,
) {
  if (isComponent(vNode) && (vNode as Types.Component<any>)[method]) {
    if (method === 'onAfterMount' || method === 'onBeforeUnmount') {
      (vNode as Types.Component<any>)[method]($node, (vNode as Types.Component<any>).state, (vNode as Types.Component<any>)._update)
    } else {
      (vNode as Types.Component<any>)[method]((vNode as Types.Component<any>).state, (vNode as Types.Component<any>)._update)
    }
  }
}

export function shouldComponentRender(node: Types.ValidVNode): boolean {
  return isComponent(node) && (node as Types.Component<any>).shouldRender ? (node as Types.Component<any>).shouldRender() : true
}

export function shouldComponentUnmount(node: Types.ValidVNode): boolean {
  return isComponent(node) && (node as Types.Component<any>).shouldRender
    ? !(node as Types.Component<any>).shouldRender()
    : false
}
