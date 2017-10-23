import { run, View } from '../src'
import simple from './simple'
import counter from './counter'

function render(app: View<any>) {
  const node = document.createElement('div')
  node.classList.add('app')
  document.body.appendChild(node)
  run(node, app)
}

render(simple)
render(counter)
