const NB_ROWS = 6
const NB_COLS = 7

function generate_empty_grid() {
    const gridContent = []
    for (let row_index = 0; row_index < NB_ROWS; row_index++) {
        const row = []
        for (let col_index = 0; col_index < NB_COLS; col_index++) {
            row.push(-1)
        }
        gridContent.push(row)
    }
    return gridContent
}

function checkLine(row, turn) {
    let consecutive_owned = 0
    return row.some(x => {
        if (x == turn) {
            consecutive_owned++
        } else {
            consecutive_owned = 0
        }
        if (consecutive_owned == 4) {
            return true
        }
        return false
    })
}

function checkWin(gridContent, row_index, col_index, turn) {
    const lines = [
        gridContent.map(row => row[col_index]),
        gridContent[row_index],
        gridContent.reduce(function (acc, row, index) {
            const j = row_index + col_index - index
            if (0 <= j && j < NB_COLS) {
                acc.push(row[j])
            }
            return acc
        }, []),
        gridContent.reduce(function (acc, row, index) {
            const j = index - row_index + col_index
            if (0 <= j && j < NB_COLS) {
                acc.push(row[j])
            }
            return acc
        }, [])
    ]
    return lines.some(line => checkLine(line, turn))
}

class PlayButton extends React.Component {

    constructor(props) {
        super(props)
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        this.props.onClick(parseInt(this.props.col))
    }

    render() {
        return <button className="play-button" onClick={this.handleClick}>Play here</button>
    }
}

class Grid extends React.Component {

    render() {
        const {nb_rows, nb_cols, content} = this.props
        const rows = []
        for (let i = 0; i < nb_rows; i++) {
            const row = []
            for (let j = 0; j < nb_cols; j++) {
                const owner = content[i][j]
                const ballClass = owner == 1 ? "ball red-ball" : owner == 0 ? "ball blue-ball" : null
                row.push(<td key={j} className="cell">
                    <div className="cell-content">
                        <div className={ballClass}></div>
                    </div>
                </td>)
            }
            rows.push(<tr key={i}>
                {row}
            </tr>)
        }
        return <table className="grid">
            <thead>
                <tr>
                    {this.props.playButtons}
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    }
}

class App extends React.Component {

    constructor(props) {
        super(props)
        this.state = {gridContent: generate_empty_grid(), turn: 0}
        this.winner = null
        this.player1Wins = 0
        this.player2Wins = 0
        this.handleResetEvent = this.handleResetEvent.bind(this)
        this.handlePlayButtonClick = this.handlePlayButtonClick.bind(this)
    }

    handleResetEvent() {
        this.setState({gridContent: generate_empty_grid(), turn: 0})
        this.winner = null
    }

    handlePlayButtonClick(col_index) {
        if (this.winner != null) {
            return
        }
        const {gridContent, turn} = this.state
        let row_index = NB_ROWS - 1
        while (row_index >= 0 && gridContent[row_index][col_index] != -1) {
            row_index--
        }
        if (row_index == -1) {
            return
        } else {
            gridContent[row_index][col_index] = turn
            this.setState({gridContent: gridContent, turn: 1 - turn})
            if (checkWin(gridContent, row_index, col_index, turn)) {
                this.winner = turn + 1
                if (this.winner == 1) {
                    this.player1Wins++
                } else if (this.winner == 2) {
                    this.player2Wins++
                }
            }
        }
    }

    render() {
        const winnerMessage = this.winner == null ? '' : <p className="winMessage">Player {this.winner} wins</p>
        const playButtons = []
        for (let j = 0; j < NB_COLS; j++) {
            playButtons.push(<th key={j}>
                <PlayButton col={j} onClick={this.handlePlayButtonClick}/>
            </th>)
        }
        return <React.Fragment>
            <h1 className="title">Puissance 4</h1>
            <div>
                <div className="playerInfo">
                    Player 1 :
                    <div className="ball blue-ball"></div>
                    <p>Number of wins : {this.player1Wins}</p>
                </div>
                <div className="playerInfo">
                    Player 2 :
                    <div className="ball red-ball"></div>
                    <p>Number of wins : {this.player2Wins}</p>
                </div>
            </div>
            {winnerMessage}
            <Grid nb_rows={NB_ROWS} nb_cols={NB_COLS} content={this.state.gridContent} playButtons={playButtons}/>
            <button className="resetButton" onClick={this.handleResetEvent}>Reset</button>
        </React.Fragment>
    }
}

ReactDOM.render(<App />, document.querySelector("#app"))