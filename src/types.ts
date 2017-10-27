export interface VNode {
  type: keyof HTMLElementTagNameMap
  props?: any
  children?: ValidVNode | ValidVNode[]
}
export type ValidVNode = VNode | string | number
export type Updater<S> = (state: S) => S
export type Update<S> = (updater: S | Updater<S>) => any
export type View<S> = (state: S, update: Update<S>) => ValidVNode
export type State = Record<string, any>
