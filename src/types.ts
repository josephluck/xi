export interface VNode {
  type: keyof HTMLElementTagNameMap
  props?: any
  children?: ValidVNode | ValidVNode[]
}
export interface Component<S> {
  state: S
  render: View<S>
  onMount?: Lifecycle<S>
  onUnmount?: Lifecycle<S>
  onUpdate?: Lifecycle<S>
}
export type ValidVNode<S=any> = Component<S> | VNode | string | number
export type Updater<S> = (state: S) => S
export type Update<S> = (updater: S | Updater<S>) => any
export type View<S> = (state: S, update: Update<S>) => ValidVNode
export type Lifecycle<S> = (state: S, update: Update<S>) => any
export type State = Record<string, any>
