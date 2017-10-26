import * as attributes from './attributes'
import * as Types from './types'
import * as utils from './utils'
export { View, Update } from './types'

export function h(type: keyof HTMLElementTagNameMap, props?: any, children?: Types.ValidVNode | Types.ValidVNode[]): Types.VNode {
  return { type, props, children }
}

const createElement = (node: Types.ValidVNode): HTMLElement | Text => {
  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(node.toString())
  } else if (utils.isPresent(node)) {
    const $el = document.createElement(node.type)
    const children = node.children instanceof Array ? node.children : [node.children]
    attributes.addAttributes($el, node.props)
    attributes.addEventListeners($el, node.props)
    children.filter(utils.isPresent).map(createElement)
      .forEach($el.appendChild.bind($el))
    return $el
  }
}

const updateElement = ($parent: HTMLElement | Node, newVNode: Types.ValidVNode, oldVNode?: Types.ValidVNode, index: number = 0) => {
  const child = $parent.childNodes[index]
  if (!utils.isPresent(oldVNode) && utils.isPresent(newVNode)) {
    $parent.appendChild(createElement(newVNode))
  } else if (!utils.isPresent(newVNode) && utils.isPresent(child)) {
    $parent.removeChild(child)
  } else if (utils.hasVNodeChanged(newVNode, oldVNode)) {
    $parent.replaceChild(createElement(newVNode), child)
  } else if (utils.isVNode(newVNode) && utils.isVNode(oldVNode)) {
    const nVNode = newVNode as Types.VNode
    const oVNode = oldVNode as Types.VNode
    const nVNodeChildren = nVNode.children instanceof Array ? nVNode.children : [nVNode.children]
    const oVNodeChildren = oVNode.children instanceof Array ? oVNode.children : [oVNode.children]
    const hChild = child as HTMLElement
    attributes.updateAttributes(hChild, nVNode.props, oVNode.props)
    attributes.updateEventListeners(hChild, nVNode.props, oVNode.props)
    utils.getLargestArray(nVNodeChildren, oVNodeChildren)
      .forEach((_, i) => updateElement(child, nVNodeChildren[i], oVNodeChildren[i], i))
  }
}

export function run<S>(elm: string | HTMLElement, view: Types.View<S>) {
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
