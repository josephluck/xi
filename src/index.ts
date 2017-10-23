export type ViableNode = HTMLElement | string | number
export type VDom = (node: keyof HTMLElementTagNameMap, params?: any, vdom?: ViableNode | ViableNode[]) => HTMLElement
export type Update<S> = (params: S) => any
export type View<S> = (state: S, update: Update<S>) => HTMLElement
export type State = Record<string, any>

const appendChild = (elm: HTMLElement) => (children: ViableNode) => {
  if (typeof children === 'string' || typeof children === 'number') {
    const span = document.createElement('span')
    span.innerHTML = children.toString()
    elm.appendChild(span)
  } else {
    elm.appendChild(children)
  }
}

export const h: VDom = (node, params, children) => {
  const elm = document.createElement(node)
  if (params) {
    Object.keys(params).forEach(key => elm[key] = params[key])
  }
  if (children !== undefined && children !== null) {
    if (children instanceof Array) {
      children.map(appendChild(elm))
    } else {
      appendChild(elm)(children)
    }
  }
  return elm
}

export function run<S>(elm: string | HTMLElement, v: View<S>) {
  const node = typeof elm === 'string' ? document.querySelector(elm) : elm
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