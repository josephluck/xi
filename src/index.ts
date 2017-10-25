export interface VNode {
  type: keyof HTMLElementTagNameMap
  props?: any
  children?: ValidVNode[]
}
export type ValidVNode = VNode | string | number
export type Update<S> = (newState: S) => any
export type View<S> = (state: S, update: Update<S>) => ValidVNode
export type State = Record<string, any>

function isEventProp(name: string): boolean {
  return /^on/.test(name)
}

function extractEventName(name: string): string {
  return name.slice(2).toLowerCase()
}

function addEventListeners($el: HTMLElement, props: any) {
  Object.keys(props).forEach(name => {
    if (isEventProp(name)) {
      $el.addEventListener(
        extractEventName(name),
        props[name]
      )
    }
  })
}

function setBooleanProp($el: HTMLElement, name: string, value: boolean) {
  if (value) {
    $el.setAttribute(name, value.toString())
    $el[name] = true
  } else {
    $el[name] = false
  }
}

function addProp($el: HTMLElement, name: string, value: any) {
  if (!isEventProp(name)) {
    if (typeof value === 'boolean') {
      setBooleanProp($el, name, value)
    } else {
      $el.setAttribute(name, value)
    }
  }
}

function removeBooleanProp($el: HTMLElement, name: string) {
  $el.removeAttribute(name)
  $el[name] = false
}

function removeProp($el: HTMLElement, name: string, value: any) {
  if (typeof value === 'boolean') {
    removeBooleanProp($el, name)
  } else {
    $el.removeAttribute(name)
  }
}

function updateProp($el: HTMLElement, name: string, oldValue: any, newValue: any) {
  if (newValue === undefined) {
    removeProp($el, name, oldValue)
  } else if (oldValue === undefined || newValue !== oldValue) {
    addProp($el, name, newValue)
  }
}

function updateProps($el: HTMLElement, newProps: any, oldProps: any = {}) {
  const props = { ...oldProps, ...newProps }
  Object.keys(props).forEach(key => updateProp($el, key, oldProps[key], newProps[key]))
}

function addProps($el: HTMLElement, props: any) {
  Object.keys(props).forEach(key => addProp($el, key, props[key]))
}

const createElement = (node: ValidVNode): HTMLElement | Text => {
  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(node.toString())
  } else if (node) {
    const $el = document.createElement(node.type)
    addProps($el, node.props)
    addEventListeners($el, node.props)
    node.children.map(createElement)
      .forEach($el.appendChild.bind($el))
    return $el
  }
}

// TODO: type this
function changed(a, b) {
  return typeof a !== typeof b ||
    typeof a === 'string' && a !== b ||
    typeof a === 'number' && a !== b ||
    a.type !== b.type
}

function isVNode(node: ValidVNode): boolean {
  return typeof node !== 'string' && typeof node !== 'number'
}

const updateElement = ($parent: HTMLElement | Node, newVNode: ValidVNode, oldVNode?: ValidVNode, index: number = 0) => {
  if (oldVNode === undefined) {
    $parent.appendChild(createElement(newVNode))
  } else if (!newVNode) {
    $parent.removeChild($parent.childNodes[index])
  } else if (changed(newVNode, oldVNode)) {
    $parent.replaceChild(createElement(newVNode), $parent.childNodes[index])
  } else if (isVNode(newVNode) && isVNode(oldVNode)) {
    // Make this better
    updateProps(($parent.childNodes[index] as HTMLElement), (newVNode as VNode).props, (oldVNode as VNode).props)
    addEventListeners(($parent.childNodes[index] as HTMLElement), (newVNode as VNode).props)
    const newLength = (newVNode as VNode).children.length
    const oldLength = (oldVNode as VNode).children.length
    for (let i = 0; i < newLength || i < oldLength; i++) {
      updateElement(
        $parent.childNodes[index],
        (newVNode as VNode).children[i],
        (oldVNode as VNode).children[i],
        i
      )
    }
  }
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