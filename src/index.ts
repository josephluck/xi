import * as attributes from './attributes'

export interface VNode {
  type: keyof HTMLElementTagNameMap
  props?: any
  children?: ValidVNode[]
}
export type ValidVNode = VNode | string | number
export type Update<S> = (newState: S) => any
export type View<S> = (state: S, update: Update<S>) => ValidVNode
export type State = Record<string, any>

const createElement = (node: ValidVNode): HTMLElement | Text => {
  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(node.toString())
  } else if (node) {
    const $el = document.createElement(node.type)
    attributes.addAttributes($el, node.props)
    attributes.addEventListeners($el, node.props)
    node.children.filter(isPresent).map(createElement)
      .forEach($el.appendChild.bind($el))
    return $el
  }
}

function hasVNodeChanged(nodeA: ValidVNode, nodeB: ValidVNode): boolean {
  let typeHasChanged = typeof nodeA !== typeof nodeB
  let stringHasChanged = typeof nodeA === 'string' && nodeA !== nodeB
  let numberHasChanged = typeof nodeA === 'number' && nodeA !== nodeB
  let vNodeTypeHasChanged = nodeA && nodeB && ((nodeA as VNode).type !== (nodeB as VNode).type)
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
  } else if (!newVNode && isPresent(child)) {
    $parent.removeChild(child)
  } else if (hasVNodeChanged(newVNode, oldVNode)) {
    $parent.replaceChild(createElement(newVNode), child)
  } else if (isVNode(newVNode) && isVNode(oldVNode)) {
    let nVNode = newVNode as VNode
    let oVNode = oldVNode as VNode
    let hChild = child as HTMLElement
    attributes.updateAttributes(hChild, nVNode.props, oVNode.props)
    attributes.updateEventListeners(hChild, nVNode.props, oVNode.props)
    Array.from({ length: getLargestNumber(nVNode.children.length, oVNode.children.length) })
      .forEach((_, i) => updateElement(child, nVNode.children[i], oVNode.children[i], i))
  }
}

function getLargestNumber(a: number, b: number) {
  return a > b ? a : b
}

export function h(type: keyof HTMLElementTagNameMap, props?: any, children?: ValidVNode[]): VNode {
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