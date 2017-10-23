import { View, run, h } from './lib'

type MyState = {
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
  }, state.title)
}

run('body', view)
