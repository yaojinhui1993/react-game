import React from 'react';
import ReactDOM from 'react-dom';
import "./index.css";

function Square(props) {
  return (
    <button
      className="square"
      style={{color: props.highlighted && 'yellow'}}
      onClick={() => props.onClick()}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {


  renderSquare(i) {
    return <Square
     value={this.props.squares[i]}
     key={i}
     onClick={() => this.props.onClick(i)}
     highlighted={this.props.square.find((value) => value === i) !== undefined}
    />;
  }

  render() {
    return (
      <div>
        {
          [1,2,3].map((index, key) => {
            return (
              <div className = "board-row" key={index}>
                {
                  [1, 2, 3].map((subIndex) => this.renderSquare((key * 3) + subIndex - 1))
                }
              </div>
            )
          })
        }
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      history: [{
        squares: Array(9).fill(null),
        move: null,
      }],
      xIsNext: true,
      stepNumber: 0,
      currentSelectedItemIndex: null,
      movesOrderIsAsc: true,
      square: [],
    }

    this.handleToggleMoveOrder = this.handleToggleMoveOrder.bind(this);
  }


  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[this.state.stepNumber];
    const squares = current.squares.slice();
    const move = {
      col: i % 3 + 1,
      row: Math.floor(i / 3) + 1
    }
    const xIsNext = this.state.xIsNext;
    if (squares[i]) return;

    const data = calculateWinner(current.squares);
    if (data) {
      return;
    }
    squares[i] = xIsNext ? 'X' : 'O';


    this.setState({
      history: history.concat({squares, move}),
      xIsNext: !xIsNext,
      stepNumber: history.length,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      currentSelectedItemIndex: step,
    })
  }

  handleToggleMoveOrder() {
    const { movesOrderIsAsc } = this.state;
    this.setState({
      movesOrderIsAsc: ! movesOrderIsAsc
    });
  }

  render() {
    let history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[this.state.stepNumber];
    const data = calculateWinner(current.squares);
    let winner;
    let square = [];
    if (data) {
      winner = data.winner;
      square = data.square;
    }
    const isDrawer = !winner && history.length >= 10;

    if (! this.state.movesOrderIsAsc) {
      history = history.reverse();
    }
    const moves = history.map((step, move) => {
      let desc;
      if (this.state.movesOrderIsAsc) {
        desc = ! move ?
          `Go to game start`:
          `Go to move #${move}(${step.move.col}, ${step.move.row})`;

      } else {

        desc = (history.length - 1) === move ?
          `Go to game start` :
          `Go to move #${move}(${step.move.col}, ${step.move.row})`;
      }


      return (
        <li key={move}>
          <button onClick = {
            () => this.jumpTo(move)
          }
          style = {
            { fontWeight: move === this.state.currentSelectedItemIndex ? 'bold' : '' }
          } >
            {desc}
          </button>
        </li>
      )
    })

    let status;
    if (winner) {
      status = `Winner: ${winner}`;
    } else {
      status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            square={square}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
        { isDrawer && 'is drawer'}
        <div>
          <button onClick={this.handleToggleMoveOrder}>Toggle Move</button>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById('root'));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], square: [a, b, c] };
    }
  }

  return null;
}