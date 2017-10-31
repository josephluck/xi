import { h, View, app, Update } from '../src'

export type State = {
  title: string
}

const defaultState: State = { title: 'Stateful components' }

interface Actions {
  updateTitle: (title: string) => any
}

function makeActions(update: Update<State>): Actions {
  return {
    updateTitle: title => update(state => ({ title })),
  }
}

const button = (text: string, onclick: () => any) => {
  return h('button', { onclick }, text)
}

const counter = (name: string) => (state = { count: 0 }, update) => {
  return h('div', {}, [
    h('div', {}, [
      button('decrement', () => update(state => ({ count: 10 }))),
      h('span', { id: state.count }, state.count),
      button('increment', () => update(state => ({ count: state.count + 1 }))),
      null
    ])
  ])
}

const view = (actions: Actions): View<State> => (state) => {
  return h('div', {}, [
    h('div', {}, [
      counter('One'),
      h('div'),
      h('input', { value: state.title, oninput: e => actions.updateTitle(e.target.value) }),
      h('span', {}, state.title),
      h('div'),
      counter('Two'),
      null
    ])
  ])
}

export default function () {
  const node = document.createElement('div')
  node.style.margin = '100px'
  document.body.appendChild(node)
  const { update, run } = app(defaultState)
  const actions = makeActions(update)
  run(node, view(actions))
}
