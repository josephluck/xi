export interface VNode {
  type: keyof HTMLElementTagNameMap
  props?: any
  children?: ValidVNode | ValidVNode[]
}
export interface Component<S> {
  state: S
  render: View<S>
  onBeforeMount?: Lifecycle<S>
  onAfterMount?: Lifecycle<S>
  onBeforeUnmount?: Lifecycle<S>
  onAfterUnmount?: Lifecycle<S>
  onBeforeUpdate?: Lifecycle<S>
  onAfterUpdate?: Lifecycle<S>
  _update?: Updater<S>
}
export type ValidLifecycleMethods =
  'onBeforeMount' |
  'onAfterMount' |
  'onBeforeUpdate' |
  'onAfterUpdate' |
  'onBeforeUnmount' |
  'onAfterUnmount'
export type ValidVNode<S=any> = Component<S> | VNode | string | number
export type Updater<S> = (state: S) => S
export type Update<S> = (updater: S | Updater<S>) => any
export type View<S> = (state: S, update: Update<S>) => ValidVNode
export type OnBeforeMount<S> = (state: S, update: Update<S>) => any
export type OnAfterMount<S> = (state: S, update: Update<S>) => any
export type OnBeforeUpdate<S> = (state: S, update: Update<S>) => any
export type OnAfterUpdate<S> = (state: S, update: Update<S>) => any
export type OnBeforeUnmount<S> = (state: S, update: Update<S>) => any
export type OnAfterUnmount<S> = (state: S, update: Update<S>) => any
export type Lifecycle<S> =
  OnBeforeMount<S> |
  OnAfterMount<S> |
  OnBeforeUpdate<S> |
  OnAfterUpdate<S> |
  OnBeforeUnmount<S> |
  OnAfterUnmount<S>
export type State = Record<string, any>
