import { run, View } from '../src'
// import simple from './simple'
import counter from './counter'
// import redux from './redux-ish'

function render(app: View<any>) {
  const node = document.createElement('div')
  node.classList.add('app')
  node.style.margin = '100px'
  node.style.border = 'solid 1px black'
  node.style.padding = '20px'
  document.body.appendChild(node)
  run(node, app)
}

// render(simple)
render(counter)
// render(redux)
