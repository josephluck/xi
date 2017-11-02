import * as attributes from './attributes'
import * as Types from './types'
import * as utils from './utils'
export { View, Update } from './types'

export function h(type: keyof HTMLElementTagNameMap, props?: any, children?: Types.ValidVNode | Types.ValidVNode[]): Types.VNode {
  return { type, props, children }
}

// Could probably marry this with the main `app` function below so that `app` takes a component (made with this fn)
function createComponent(
  $parent: HTMLElement,
  component: Types.Component<any>,
  index: number = 0,
): HTMLElement | Text {
  let state = component.state
  const update = (updater: Types.Updater<any>) => {
    state = typeof updater === 'function'
      ? updater(state)
      : updater
    component.state = state
    render()
  }
  function render() {
    const oldChild = $parent.childNodes[index]
    const newChild = createElement(component.render(state, update))
    if (oldChild) {
      $parent.replaceChild(newChild, oldChild)
    } else {
      $parent.appendChild(newChild)
    }
  }
  return createElement(component.render(state, update))
}

function createElement(
  node: Types.ValidVNode,
  $parent?: HTMLElement,
  index?: number,
): HTMLElement | Text {
  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(node.toString())
  } else if (utils.isVNode(node)) {
    const vNode = node as Types.VNode
    const $parent = document.createElement(vNode.type)
    const children = vNode.children instanceof Array ? vNode.children : [vNode.children]
    attributes.addAttributes($parent, vNode.props)
    attributes.addEventListeners($parent, vNode.props)
    children.filter(utils.isPresent).map((child, index) => {
      return utils.isComponent(child)
        ? createComponent($parent, child as Types.Component<any>, index)
        : createElement(child)
    }).forEach($parent.appendChild.bind($parent))
    return $parent
  } else if (utils.isComponent(node) && $parent) {
    return createComponent($parent, node as Types.Component<any>, index)
  }
}

function hasComponentChanged(newComponent: Types.ValidVNode, oldComponent: Types.ValidVNode): boolean {
  return utils.isComponent(newComponent) && utils.isComponent(oldComponent)
}

function updateElement(
  $parent: HTMLElement,
  newVNode: Types.ValidVNode,
  oldVNode?: Types.ValidVNode,
  index: number = 0,
) {
  const child = $parent.childNodes[index] as HTMLElement
  if (!utils.isPresent(oldVNode) && utils.isPresent(newVNode)) {
    $parent.appendChild(createElement(newVNode, $parent as HTMLElement, index))
  } else if (!utils.isPresent(newVNode) && utils.isPresent(child)) {
    $parent.removeChild(child)
  } else if (utils.hasVNodeChanged(newVNode, oldVNode)) {
    $parent.replaceChild(createElement(newVNode), child)
  } else if (hasComponentChanged(newVNode, oldVNode)) {
    (newVNode as Types.Component<any>).state = (oldVNode as Types.Component<any>).state
    $parent.replaceChild(createElement(newVNode, $parent as HTMLElement, index), child)
  } else if (utils.isVNode(newVNode) && utils.isVNode(oldVNode)) {
    const nVNode = newVNode as Types.VNode
    const oVNode = oldVNode as Types.VNode
    const nVNodeChildren = nVNode.children instanceof Array ? nVNode.children : [nVNode.children]
    const oVNodeChildren = oVNode.children instanceof Array ? oVNode.children : [oVNode.children]
    attributes.updateAttributes(child, nVNode.props, oVNode.props)
    attributes.updateEventListeners(child, nVNode.props, oVNode.props)
    utils.getLargestArray(nVNodeChildren, oVNodeChildren)
      .forEach((c, i) => {
        updateElement(child, nVNodeChildren[i], oVNodeChildren[i], i)
      })
  }
}

export function app<S>(state: S) {
  let oldVNode
  let app
  let node
  const render = () => {
    const newVNode = app(state, update)
    updateElement(node, newVNode, oldVNode)
    oldVNode = newVNode
  }
  function run(elm: string | HTMLElement, view: Types.View<S>) {
    app = view
    node = typeof elm === 'string' ? document.querySelector(elm) : elm
    render()
  }
  function update(updater: Types.Updater<S>) {
    state = typeof updater === 'function'
      ? updater(state)
      : updater
    render()
  }
  return { update, run }
}
