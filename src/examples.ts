import { run, View } from './lib'
import simple from './examples/simple'

function render(app: View<any>) {
  const node = document.createElement('div')
  node.classList.add('app')
  document.body.appendChild(node)
  run(node, app)
}

render(simple)
