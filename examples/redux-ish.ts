import { View, h, Update } from '../src'

/*
Redux-ish helper functions
*/

export type Reducer<S, A> = (state: S, actions: A) => S

export interface Action {
  type: string
  payload: any
}

function redux<S, A>(reducer: Reducer<S, A>) {
  return function makeDispatch(state: S, update: Update<S>) {
    return function dispatch(action: A) {
      update(reducer(state, action))
    }
  }
}

/*
Client code
*/

export type MyState = {
  count: number
}

const defaultState: MyState = { count: 0 }

export interface Increment extends Action {
  type: 'increment'
  payload: number
}

export interface Decrement extends Action {
  type: 'decrement'
  payload: number
}

export type Actions = Increment | Decrement

const makeDispatch = redux((state: MyState, action: Actions) => {
  switch (action.type) {
    case 'increment': {
      return {
        count: state.count + action.payload
      }
    }
    case 'decrement': {
      return {
        count: state.count - action.payload
      }
    }
  }
})

const button = (text: string, onclick: () => any) => {
  return h('button', { onclick }, text)
}

const view: View<MyState> = (state = defaultState, update) => {
  const dispatch = makeDispatch(state, update)
  const increment = () => dispatch({ type: 'increment', payload: 2 })
  const decrement = () => dispatch({ type: 'decrement', payload: 1 })
  return h('div', {}, h('div', {}, [
    button('decrement', decrement),
    h('span', {}, state.count),
    button('increment', increment),
  ]))
}

export default view
