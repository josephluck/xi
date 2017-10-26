import { View, h } from '../src'

export type MyState = {
  title: string
}

const defaultState: MyState = { title: 'Hello' }

const view: View<MyState> = (state = defaultState, update) => {
  const updateTitle = () => {
    update({ title: Date.now().toString() })
  }
  return h('div', {
    id: 'my-div',
    onclick: updateTitle,
  }, [state.title])
}

export default function (render) {
  render(view)
}
