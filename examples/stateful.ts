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
  return h('div', { id: `counter-${name}` }, [
    button('decrement', () => update({ count: state.count - 1 })),
    h('span', { id: state.count }, `${state.count} for ${name}`),
    button('increment', () => update({ count: state.count + 1 })),
    null
  ])
}

const view = (actions: Actions): View<State> => (state) => {
  return h('div', { id: 'container' }, [
    counter(state.title),
    h('input', { value: state.title, oninput: e => actions.updateTitle(e.target.value) }),
    state.title,
    counter(state.title + ' Two'),
    null
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
