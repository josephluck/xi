# ‎π pion

A minimum viable front-end framework

## Why?

Don't use this :-) It's really just an indulgent idea of how small a UI framework can be. It's extremely slow and good for... well, nothing much of anything really.

## Overview

Pion has only a few concepts:

### Views

Views render HTML elements to the page:

```javascript
h('div', { id: 'pion-app', 'Pion is super small!' }) // --> <div id='pion-app'>Pion is super small</div> 
```

### State

State is a single global state atom, a'la Redux and friends. You can update state with the convenient `updateState` function passed in to all views.

```javascript
function view (state = { title: 'Pion is cool' }, update) {
  const updateTitle = () => update({title: 'Pion is AWESOME'})
  return h('div', { onclick: updateTitle }, state.title)
}
```

### Components

There aren't any stateful components in Pion. However, if you want reusable bits of UI then use functions, just like React stateless functional components. Remember, state down, actions up!

## Example Usage

See the `examples` folder for a few ideas.

## Performance

Eh, go use React or something better :wink: