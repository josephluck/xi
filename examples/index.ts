import { run, View } from '../src'
import ticTacToe from './tic-tac-toe'
import simple from './simple'
import counter from './counter'
import redux from './redux-ish'

function render(app: View<any>) {
  const node = document.createElement('div')
  node.classList.add('app')
  node.style.margin = '100px'
  document.body.appendChild(node)
  run(node, app)
}

ticTacToe(render)
simple(render)
counter(render)
redux(render)
