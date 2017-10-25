import * as attributes from './attributes'

export interface VNode {
  type: keyof HTMLElementTagNameMap
  props?: any
  children?: ValidVNode | ValidVNode[]
}
export type ValidVNode = VNode | string | number
export type Update<S> = (newState: S) => any
export type View<S> = (state: S, update: Update<S>) => ValidVNode
export type State = Record<string, any>

const createElement = (node: ValidVNode): HTMLElement | Text => {
  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(node.toString())
  } else if (isPresent(node)) {
    const $el = document.createElement(node.type)
    const children = node.children instanceof Array ? node.children : [node.children]
    attributes.addAttributes($el, node.props)
    attributes.addEventListeners($el, node.props)
    children.filter(isPresent).map(createElement)
      .forEach($el.appendChild.bind($el))
    return $el
  }
}

function hasVNodeChanged(nodeA: ValidVNode, nodeB: ValidVNode): boolean {
  let typeHasChanged = typeof nodeA !== typeof nodeB
  let stringHasChanged = typeof nodeA === 'string' && nodeA !== nodeB
  let numberHasChanged = typeof nodeA === 'number' && nodeA !== nodeB
  let vNodeTypeHasChanged = isPresent(nodeA) && isPresent(nodeB) && ((nodeA as VNode).type !== (nodeB as VNode).type)
  return typeHasChanged || stringHasChanged || numberHasChanged || vNodeTypeHasChanged
}

function isVNode(node: ValidVNode): boolean {
  return isPresent(node) && typeof node !== 'string' && typeof node !== 'number'
}

function isPresent(node: any): boolean {
  return node !== null && node !== undefined
}

const updateElement = ($parent: HTMLElement | Node, newVNode: ValidVNode, oldVNode?: ValidVNode, index: number = 0) => {
  const child = $parent.childNodes[index]
  if (oldVNode === undefined && isPresent(newVNode)) {
    $parent.appendChild(createElement(newVNode))
  } else if (!isPresent(newVNode) && isPresent(child)) {
    $parent.removeChild(child)
  } else if (hasVNodeChanged(newVNode, oldVNode)) {
    $parent.replaceChild(createElement(newVNode), child)
  } else if (isVNode(newVNode) && isVNode(oldVNode)) {
    const nVNode = newVNode as VNode
    const oVNode = oldVNode as VNode
    const nVNodeChildren = nVNode.children instanceof Array ? nVNode.children : [nVNode.children]
    const oVNodeChildren = oVNode.children instanceof Array ? oVNode.children : [oVNode.children]
    const hChild = child as HTMLElement
    attributes.updateAttributes(hChild, nVNode.props, oVNode.props)
    attributes.updateEventListeners(hChild, nVNode.props, oVNode.props)
    Array.from({ length: getLargestNumber(nVNodeChildren.length, oVNodeChildren.length) })
      .forEach((_, i) => updateElement(child, nVNodeChildren[i], oVNodeChildren[i], i))
  }
}

function getLargestNumber(a: number, b: number) {
  return a > b ? a : b
}

export function h(type: keyof HTMLElementTagNameMap, props?: any, children?: ValidVNode | ValidVNode[]): VNode {
  return { type, props, children }
}

export function run<S>(elm: string | HTMLElement, view: View<S>) {
  const node = typeof elm === 'string' ? document.querySelector(elm) : elm
  let state
  let oldVNode
  const update = (newState: S) => {
    state = newState
    render()
  }
  const render = () => {
    const newVNode = view(state, update)
    updateElement(node, newVNode, oldVNode)
    oldVNode = newVNode
  }
  render()
}