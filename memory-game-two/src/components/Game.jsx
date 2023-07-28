import React, { Component } from 'react';
import SinglePlayer from './SinglePlayer';
import MultiPlayer from './MultiPlayer';
import MultiPlayerReducer from './MultiPlayerReducer';

class Game extends Component {
    render() {
        return (
            <div className="app-game">{this.props.isMultiPlayer ? <MultiPlayerReducer {...this.props} /> : <SinglePlayer {...this.props} />}</div>
        );
    }
}

export default Game;