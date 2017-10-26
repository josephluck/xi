import { h, View } from '../src'

type Player = 'x' | 'o'
type Square = '' | Player
type Row = Square[]
type Board = Row[]
type Winner = Player | boolean

type State = {
  board: Board
  turn: Player
  winner: Winner
}

const defaultState: State = {
  board: emptyBoard(),
  turn: 'x',
  winner: false,
}

function getAllRows(board: Board): Square[][] {
  return board
}

function getAllColumns(board: Board): Square[][] {
  return Array.from({ length: board.length })
    .map((_, columnIndex) => {
      return board.reduce((prev, row) => {
        return [...prev, row[columnIndex]]
      }, [])
    })
}

function isWon(vertice: Square[]): boolean {
  return vertice.every(square => square === 'x') || vertice.every(square => square === 'o')
}

function getWinningCombo(board: Board): Winner {
  const combos = [...getAllRows(board), ...getAllColumns(board)]
  return combos
    .reduce((prev, vertice) => {
      return prev
        ? prev
        : isWon(vertice)
          ? vertice[0] as Player
          : false
    }, false as Winner)
}

function getWinner(board: Board): Winner {
  const winner = getWinningCombo(board)
  return winner ? winner : false
}

function emptyBoard(): Board {
  return Array.from({ length: 3 })
    .map(() => Array.from({ length: 3 })
      .map(() => '' as Square)
    )
}

function updateBoard(state: State, clickedRowIndex: number, clickedColumnIndex: number): State {
  const turn = state.turn === 'x' ? 'o' : 'x'
  const board = state.board.map((row, rowIndex) => row.map((square, columnIndex) => {
    const isWherePlayerClicked = clickedRowIndex === rowIndex && clickedColumnIndex === columnIndex && square === ''
    return isWherePlayerClicked ? turn : square
  }))
  return {
    board,
    turn,
    winner: getWinner(board)
  }
}

const renderSquare = (onclick: (rowIndex: number, columnIndex: number) => any, rowIndex: number) => (square: Square, columnIndex: number) => {
  return h('div', {
    style: 'width: 10px; height: 10px; display: inline-block; margin: 5px; border: solid 1px black;',
    onclick: square === '' ? () => onclick(rowIndex, columnIndex) : undefined,
  }, square)
}

const renderRow = (onclick: (rowIndex: number, columnIndex: number) => any) => (row: Row, rowIndex: number) => {
  return h('div', {}, row.map(renderSquare(onclick, rowIndex)))
}

const view: View<State> = (state = defaultState, update) => {
  const onclick = (rowIndex: number, columnIndex: number) => {
    if (!state.winner) {
      update(updateBoard(state, rowIndex, columnIndex))
    }
  }
  const renderWinner = () => {
    if (state.winner) {
      return `Player ${state.winner} won!`
    } else {
      return null
    }
  }
  const renderBoard = () => h('div', {}, state.board.map(renderRow(onclick)))
  return h('div', {}, [renderBoard(), renderWinner()])
}

export default function (render) {
  render(view)
}
