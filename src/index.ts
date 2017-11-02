import * as attributes from './attributes'
import * as Types from './types'
import * as utils from './utils'
export { View, Update, Component } from './types'

export function h(type: keyof HTMLElementTagNameMap, props?: any, children?: Types.ValidVNode | Types.ValidVNode[]): Types.VNode {
  return { type, props, children }
}

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
      // Perhaps the ability to prevent this from happening from the component
      // level would be good... something like 'shouldRender()'
      // would allow for things like 3rd party libraries
      $parent.replaceChild(newChild, oldChild)
    } else {
      $parent.appendChild(newChild)
    }
  }
  component._update = update
  return createElement(component.render(state, update))
}

function createElement(
  node: Types.ValidVNode,
  $parent?: HTMLElement,
  index?: number,
  create: boolean = false
): HTMLElement | Text {
  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(node.toString())
  } else if (utils.isVNode(node)) {
    const vNode = node as Types.VNode
    const $parent = document.createElement(vNode.type)
    const children = vNode.children instanceof Array ? vNode.children : [vNode.children]
    attributes.addAttributes($parent, vNode.props)
    attributes.addEventListeners($parent, vNode.props)
    children.filter(utils.isPresent).map((child, i) => {
      if (create) {
        lifecycle('onMount', child)
      }
      return utils.isComponent(child)
        ? createComponent($parent, child as Types.Component<any>, i)
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

const lifecycle = (
  method: Types.ValidLifecycleMethods,
  vNode: Types.ValidVNode,
) => {
  if (utils.isComponent(vNode) && (vNode as Types.Component<any>)[method]) {
    (vNode as Types.Component<any>)[method]((vNode as Types.Component<any>).state, (vNode as Types.Component<any>)._update)
  }
}

function updateElement(
  $parent: HTMLElement,
  newVNode: Types.ValidVNode,
  oldVNode?: Types.ValidVNode,
  index: number = 0,
) {
  const child = $parent.childNodes[index] as HTMLElement
  if (!utils.isPresent(oldVNode) && utils.isPresent(newVNode)) {
    lifecycle('onBeforeMount', newVNode)
    $parent.appendChild(createElement(newVNode, $parent as HTMLElement, index, true))
    lifecycle('onAfterMount', newVNode)
  } else if (!utils.isPresent(newVNode) && utils.isPresent(child)) {
    lifecycle('onBeforeUnmount', oldVNode)
    $parent.removeChild(child)
    lifecycle('onAfterUnmount', oldVNode)
  } else if (utils.hasVNodeChanged(newVNode, oldVNode)) {
    lifecycle('onBeforeUpdate', newVNode)
    $parent.replaceChild(createElement(newVNode), child)
    lifecycle('onAfterUpdate', newVNode)
  } else if (hasComponentChanged(newVNode, oldVNode)) {
    (newVNode as Types.Component<any>).state = (oldVNode as Types.Component<any>).state
    lifecycle('onBeforeUpdate', newVNode)
    $parent.replaceChild(createElement(newVNode, $parent as HTMLElement, index), child)
    lifecycle('onAfterUpdate', newVNode)
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
