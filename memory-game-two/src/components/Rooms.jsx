import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Difficulties from '../constants/Difficulties';
import { requestMembers, getMembers, requestRoomStatuses, getRoomsStatuses } from '../socket';

function roomStateReducer(roomsState, action) {
    // each action is a callback from socket
    switch (action.type) {
        case "getMembers": {
            return {
                ...roomsState,
                members: action.data
            }
        }
        case "getRoomStatuses": {
            return {
                ...roomsState,
                roomStatuses: action.roomStatuses
            }
        }
        case "toggleGameType": {
            return {
                ...roomsState,
                gameType: !roomsState.gameType
            }
        }

class Rooms extends Component {

    const [roomsState, dispatch] = useReducer(roomStateReducer, {
        gameType: false,
        members: new Array(12).fill(0),
        roomStatuses: new Array(12).fill(true)
    })

    constructor(props) {
        super(props);

        this.state = {
            gameType: false,
            members: new Array(12).fill(0),
            roomStatuses: new Array(12).fill(true)
        };

        this.toggleGameType = this.toggleGameType.bind(this);
        this.startGame = this.startGame.bind(this);
    }

    componentWillMount() {
        this.props.fetchRooms();
    }

    useEffect(() => {
        requestMembers();
        getMembers(data => {
            //this.setState({ members: data })
            dispatch({type: "getMembers", data: data})
        });

        requestRoomStatuses();
        getRoomsStatuses(roomStatuses => {
            //this.setState({ roomStatuses: roomStatuses });
            dispatch({type: "getRoomStatues", roomStatuses: roomStatuses})
        });
    }, [])

    toggleGameType() {
        this.setState({ gameType: !this.state.gameType })
        dispatch({action: "toggleGameType"})
    }

    startGame(room) {
        if (!roomsState.gameType || (
                room.members != roomsState.members[room.id].length && roomsState.roomStatuses[room.id]
            )) {
            props.startGame(room, roomsState.gameType);
        }
    }

    render() {
        return (
            <div className="rooms-area">
                <div className="game-types">
                    <div className={!this.state.gameType ? 'game-type active': 'game-type'} onClick={this.state.gameType ? this.toggleGameType : null}>Singular</div>
                    <div className={this.state.gameType ? 'game-type active': 'game-type'} onClick={!this.state.gameType ? this.toggleGameType : null}>Multiplayer</div>
                </div>
                <div className="rooms">
                    <table className={!this.state.gameType ? 'table singular-rooms active': 'table singular-rooms'}>
                        <thead>
                            <tr>
                                <th>Room</th>
                                <th>Difficulty</th>
                                <th>Join</th>
                            </tr>
                        </thead>
                        <tbody>
                            { this.props.rooms && this.props.rooms.map((room, key) => (
                                <tr key={key} className="room">
                                    <td className="name">{room.name}</td>
                                    <td className={'difficulty ' + Difficulties[room.difficulty]}>{Difficulties[room.difficulty]}</td>
                                    <td className="options" onClick={() => this.startGame(room)}><i className="fas fa-sign-in-alt"></i></td>
                                </tr>
                            )) }
                        </tbody>
                    </table>
                    <table className={this.state.gameType ? 'table multiple-rooms active': 'table multiple-rooms'}>
                        <thead>
                            <tr>
                                <th>Room</th>
                                <th>Members</th>
                                <th>Difficulty</th>
                                <th>Join</th>
                            </tr>
                        </thead>
                        <tbody>
                            { this.props.rooms && this.props.rooms.map((room, key) => (
                                <tr key={key} className="room">
                                    <td className="name">{room.name}</td>
                                    <td className="members">
                                        { [...new Array(room.members).keys()].map((member, id) => (
                                            <span key={id} className={this.state.members[room.id].length > id ? "fa fa-user" : "far fa-user"}></span>
                                        )) }
                                    </td>
                                    <td className={'difficulty ' + Difficulties[room.difficulty]}>{Difficulties[room.difficulty]}</td>
                                    <td className="options" onClick={() => this.startGame(room)}>
                                        <i className={this.state.roomStatuses[room.id] ? "fas fa-sign-in-alt" : "far fa-times-circle"}></i>
                                    </td>
                                </tr>
                            )) }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

Rooms.propTypes = {
    fetchRooms: PropTypes.func.isRequired,
    rooms: PropTypes.array.isRequired,
    startGame: PropTypes.func.isRequired,
    endGame: PropTypes.func.isRequired
};

export default Rooms;