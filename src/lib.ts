export type VDom = (node: keyof HTMLElementTagNameMap, params?: any, vdom?: HTMLElement | string) => HTMLElement
export type Update<S> = (params: S) => any
export type View<S> = (state: S, update: Update<S>) => HTMLElement
export type State = Record<string, any>

export const h: VDom = (node, params, children) => {
  const elm = document.createElement(node)
  if (params) {
    Object.keys(params).forEach(key => elm[key] = params[key])
  }
  if (children) {
    if (typeof children === 'string') {
      elm.innerHTML = children
    } else {
      elm.appendChild(children)
    }
  }
  return elm
}

export function run<S>(selector: string, v: View<S>) {
  const node = document.querySelector(selector)
  let state
  let oldVNode
  const update = (newState: S) => {
    state = newState
    render()
  }
  const render = () => {
    const newVNode = v(state, update)
    if (oldVNode) {
      node.replaceChild(newVNode, oldVNode)
    } else {
      node.appendChild(newVNode)
    }
    oldVNode = newVNode
  }
  render()
}