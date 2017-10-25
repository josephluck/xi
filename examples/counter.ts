import { View, h } from '../src'

export type MyState = {
  count: number
}

const defaultState: MyState = { count: 1000 }

const button = (text: string, onclick: () => any) => {
  return h('button', { onclick }, [text])
}

const view: View<MyState> = (state = defaultState, update) => {
  const increment = () => {
    update({ count: state.count + 10 })
  }
  const decrement = () => {
    update({ count: state.count - 10 })
  }
  return h('div', {}, [
    h('div', {}, [
      button('decrement', decrement),
      h('span', { id: state.count }, [state.count]),
      button('increment', increment),
      null
    ])
  ])
}

export default view
