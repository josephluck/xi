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

const counter = (name: string) => {
  return {
    state: { count: 0 },
    onMount(state, update) {
      console.log(state, update)
    },
    onUnmount(state, update) {
      console.log(state, update)
    },
    onUpdate(state, update) {
      console.log(state, update)
    },
    render(state, update) {
      return h('div', { id: `counter-${name}`, style: 'margin: 10px' }, [
        button('decrement', () => update({ count: state.count - 1 })),
        h('span', { id: state.count }, `${state.count} for ${name}`),
        button('increment', () => update({ count: state.count + 1 })),
        null
      ])
    }
  }
}

const conditionalCounter = {
  state: { showing: false },
  onMount(state, update) {
    console.log(state, update)
  },
  onUnmount(state, update) {
    console.log(state, update)
  },
  onUpdate(state, update) {
    console.log(state, update)
  },
  render(state, update) {
    return h('div', { id: 'conditional-counter', style: 'margin: 10px; border: solid 1px' }, [
      state.showing ? counter('conditional-counter') : null,
      button('toggle counter', () => update({ showing: !state.showing })),
      state.showing ? counter('conditional-counter') : null,
    ])
  }
}

const view = (actions: Actions): View<State> => (state) => {
  return h('div', { id: 'container' }, [
    counter(state.title),
    conditionalCounter,
    h('div', { style: 'margin: 10px; border: solid 1px' }, [
      h('input', { value: state.title, oninput: e => actions.updateTitle(e.target.value) }),
      state.title,
    ]),
    counter(state.title + ' Two'),
    state.title === '' ? conditionalCounter : null,
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
