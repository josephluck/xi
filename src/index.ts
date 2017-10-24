export type ValidVNode = HTMLElement | string | number
export type VNode = (node: keyof HTMLElementTagNameMap, params?: any, vdom?: ValidVNode | ValidVNode[]) => HTMLElement
export type Update<S> = (params: S) => any
export type View<S> = (state: S, update: Update<S>) => HTMLElement
export type State = Record<string, any>

const appendVNode = (parent: HTMLElement) => (children: ValidVNode) => {
  if (typeof children === 'string' || typeof children === 'number') {
    const span = document.createElement('span')
    span.innerHTML = children.toString()
    parent.appendChild(span)
  } else {
    parent.appendChild(children)
  }
}

export const h: VNode = (node, params, children) => {
  const elm = document.createElement(node)
  if (params) {
    Object.keys(params).forEach(key => elm[key] = params[key])
  }
  if (children !== undefined && children !== null) {
    if (children instanceof Array) {
      children.map(appendVNode(elm))
    } else {
      appendVNode(elm)(children)
    }
  }
  return elm
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
    if (oldVNode) {
      node.replaceChild(newVNode, oldVNode)
    } else {
      node.appendChild(newVNode)
    }
    oldVNode = newVNode
  }
  render()
}