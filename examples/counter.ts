import { View, h } from '../src'

export type MyState = {
  count: number
}

const defaultState: MyState = { count: 0 }

const button = (text: string, onclick: () => any) => {
  return h('button', { onclick }, text)
}

const view: View<MyState> = (state = defaultState, update) => {
  const increment = () => update({ count: state.count + 1 })
  const decrement = () => update({ count: state.count - 1 })
  return h('div', {}, h('div', {}, [
    button('decrement', decrement),
    h('span', {}, state.count),
    button('increment', increment),
  ]))
}

export default view
