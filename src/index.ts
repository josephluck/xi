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
    const $oldNode = $parent.childNodes[index]
    const $newNode = createElement(component.render(state, update))
    if (utils.shouldComponentRender(component)) {
      if ($oldNode) {
        utils.lifecycle('onBeforeReplace', component)
        $parent.replaceChild($newNode, $oldNode)
        utils.lifecycle('onAfterReplace', component)
      } else {
        utils.lifecycle('onBeforeMount', component)
        $parent.appendChild($newNode)
        utils.lifecycle('onAfterMount', component)
      }
    }
  }
  component._update = update
  return utils.shouldComponentRender(component)
    ? createElement(component.render(state, update))
    : document.createTextNode('') // Should return null here...
}

function createElement(
  validVNode: Types.ValidVNode,
  $parent?: HTMLElement,
  index?: number,
  create: boolean = false
): HTMLElement | Text {
  if (typeof validVNode === 'string' || typeof validVNode === 'number') {
    return document.createTextNode(validVNode.toString())
  } else if (utils.isVNode(validVNode)) {
    const vNode = validVNode as Types.VNode
    const $parent = document.createElement(vNode.type)
    const children = (vNode.children instanceof Array ? vNode.children : [vNode.children])
      .filter(utils.isPresent)
    attributes.addAttributes($parent, vNode.props)
    attributes.addEventListeners($parent, vNode.props)
    if (create) {
      children
        .filter(utils.shouldComponentRender)
        .forEach(child => utils.lifecycle('onBeforeMount', child))
    }
    children
      .map((child, i) => utils.isComponent(child)
        ? createComponent($parent, child as Types.Component<any>, i)
        : createElement(child)
      )
      .forEach($parent.appendChild.bind($parent))
    if (create) {
      children
        .filter(utils.shouldComponentRender)
        .forEach((child, i) => utils.lifecycle('onAfterMount', child, $parent.childNodes[i] as HTMLElement))
    }
    return $parent
  } else if (utils.isComponent(validVNode) && $parent) {
    return createComponent($parent, validVNode as Types.Component<any>, index)
  }
}

function updateElement(
  $parent: HTMLElement,
  newVNode: Types.ValidVNode,
  oldVNode?: Types.ValidVNode,
  index: number = 0,
) {
  const $child = $parent.childNodes[index] as HTMLElement
  const vNodeRemoved = !utils.isPresent(newVNode) && utils.isPresent($child)
  const shouldComponentUnmount = false // TODO: make this wurk

  if (!utils.isPresent(oldVNode) && utils.isPresent(newVNode) && utils.shouldComponentRender(newVNode)) {
    utils.lifecycle('onBeforeMount', newVNode)
    const toAppend = createElement(newVNode, $parent as HTMLElement, index, true)
    $parent.appendChild(toAppend)
    utils.lifecycle('onAfterMount', newVNode, toAppend as HTMLElement)
  }

  else if (vNodeRemoved || shouldComponentUnmount) {
    utils.lifecycle('onBeforeUnmount', oldVNode, $child)
    $parent.removeChild($child)
    utils.lifecycle('onAfterUnmount', oldVNode)
  }

  else if (utils.hasVNodeChanged(newVNode, oldVNode)) {
    utils.lifecycle('onBeforeReplace', newVNode)
    $parent.replaceChild(createElement(newVNode), $child)
    utils.lifecycle('onAfterReplace', newVNode)
  }

  else if (utils.hasComponentChanged(newVNode, oldVNode)) {
    (newVNode as Types.Component<any>).state = (oldVNode as Types.Component<any>).state
    utils.lifecycle('onBeforeReplace', newVNode)
    $parent.replaceChild(createElement(newVNode, $parent as HTMLElement, index), $child)
    utils.lifecycle('onAfterReplace', newVNode)
  }

  else if (utils.isVNode(newVNode) && utils.isVNode(oldVNode)) {
    const nVNode = newVNode as Types.VNode
    const oVNode = oldVNode as Types.VNode
    const nVNodeChildren = nVNode.children instanceof Array
      ? nVNode.children
      : [nVNode.children]
    const oVNodeChildren = oVNode.children instanceof Array
      ? oVNode.children
      : [oVNode.children]
    attributes.updateAttributes($child, nVNode.props, oVNode.props)
    attributes.updateEventListeners($child, nVNode.props, oVNode.props)
    utils.getLargestArray(nVNodeChildren, oVNodeChildren)
      .forEach((c, i) => updateElement($child, nVNodeChildren[i], oVNodeChildren[i], i))
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
