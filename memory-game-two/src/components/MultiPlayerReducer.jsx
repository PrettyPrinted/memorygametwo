import React, { Component, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'reactstrap';
import Modal from '../components/Modal';
import Difficulties from '../constants/Difficulties';
import { init } from '../scripts/init';
import {
    addMember, getMembers, removeMember,
    setItems, getItems, setFlipped, getFlipped,
    isRemoved, setRoomStatuses
} from '../socket';
import backFace from '../images/grooming-1801287_640.png';

const initialGameState = {
    flippedIndexes: [],
    flippedKeys: [],
    items: [],
    gameEnded: false,
    members: [],
    memberId: '',
    started: false,
    activeMemberId: '',
    points: {},
    winner: ''
}

function gameStateReducer(gameState, action) {
    // each action is a callback from socket
    switch (action.type) {
        case "getItems": {
            if (action.data.room === action.gameRoom.id) {
                return {
                    ...gameState,
                    items: action.data.items
                };
            }
            return {
                ...gameState
            };      
        }
        case "getFlipped": {
            if (action.data.room == action.gameRoom.id) {
                return {
                    ...gameState,
                    flippedIndexes: action.data.flippedIndexes,
                    flippedKeys: action.data.flippedKeys
                }
            }
            return {...gameState};
        }
        case "twoCardsFlipped": {
            let gameEnded = gameState.gameEnded;
            let winner = gameState.winner;
            let flippedIndexes = gameState.flippedIndexes;
            let activeMemberId = gameState.activeMemberId;
            let points = {...gameState.points}

            if (gameState.flippedKeys[0] === gameState.flippedKeys[1]) {
                let updatedPoints = gameState.points[gameState.activeMemberId] + 2;
                points = {...points, [gameState.activeMemberId]: updatedPoints}
                if (gameState.flippedIndexes.length === gameState.items.length) {
                    //const points = gameState.points;
                    winner = Object.keys(points).reduce((a, b) => {
                        return points[a] > points[b] ? a : (points[a] < points[b] ? b : '');
                    });
                    gameEnded = true;
                }
            } else {
                
                flippedIndexes.splice(-2, 2);

                /* Change Active Member */
                let members = gameState.members[action.gameRoom.id];
                let nextActive = members.indexOf(gameState.activeMemberId) + 1;
                if (nextActive >= members.length) {
                    nextActive = 0;
                }
                activeMemberId = members[nextActive];
            }

            return {
                ...gameState,
                points: points,
                gameEnded: gameEnded,
                winner: winner,
                flippedIndexes: flippedIndexes,
                flippedKeys: [],
                activeMemberId: activeMemberId
            }
        }
        case "getMembers": {
            /* set active member id */
            let activeMemberId = gameState.activeMemberId;
            if (gameState.activeMemberId) {
                let members = gameState.members[action.gameRoom.id];
                let nextActive = members.indexOf(gameState.activeMemberId);
                if (nextActive >= action.data[action.gameRoom.id].length) {
                    nextActive = 0;
                }
                activeMemberId = action.data[action.gameRoom.id][nextActive];
            } else {
                activeMemberId = action.data[action.gameRoom.id][0];
            }

            /* get all members */

            /* set initial points */
            let points = {...gameState.points};
            for (let memberId of action.data[action.gameRoom.id]) {
                if (!gameState.points[memberId]) {
                    points = {...points, [memberId]: 0}
                }
            }
            
            /* set current member */
            let memberId = gameState.memberId;
            if (!gameState.memberId) {
                memberId = action.data[action.gameRoom.id][action.data[action.gameRoom.id].length-1];
            }

            /* start if all members arrived */
            let started = gameState.started;
            if (action.data[action.gameRoom.id].length === action.gameRoom.members) {
                started = true;
            }

            return {
                ...gameState,
                activeMemberId: activeMemberId,
                members: action.data,
                memberId: memberId,
                points: points,
                started: started
            };
        }
        case "isRemoved": {
            if (action.removed && gameState.members[action.gameRoom.id].length === 1 && gameState.started) {
                return {
                    ...gameState,
                    gameEnded: true,
                    winner: gameState.members[action.gameRoom.id][0]
                }
            }
            return {...gameState};
        }
    }
}

function MultiPlayerReducer({ gameRoom, endGame }) {
    const [gameState, dispatch] = useReducer(gameStateReducer, initialGameState);

    useEffect(() => {
        if (gameState.gameEnded) {
            setTimeout(() => {
                setRoomStatuses(gameRoom.id, true);
                endGame();
            }, 5000);
        }
    }, [gameState.gameEnded, gameRoom])
    
    useEffect(() => {
        if (gameState.flippedKeys.length === 2) {
            setTimeout(() => {
                dispatch({type: "twoCardsFlipped", gameRoom: gameRoom})
            }, 1000)
        }
    }, [gameState.flippedKeys, gameRoom]);
    
    useEffect(() => {
        if (gameState.started) {
            setRoomStatuses(gameRoom.id, false);
        }
    }, [gameState.started, gameRoom])
    
    useEffect(() => {
        const { items } = init(gameRoom.difficulty);
        setItems(gameRoom.id, items);
    
        getItems(data => {
            dispatch({type: "getItems", data: data, gameRoom: gameRoom})
        });
    
        getFlipped(async data => {
            dispatch({type: "getFlipped", data: data, gameRoom: gameRoom})
        });
    
        addMember(gameRoom.id);
    
        getMembers(data => {
            dispatch({type: "getMembers", data: data, gameRoom: gameRoom})
        });
    
        isRemoved(removed => {
            dispatch({type: "getMembers", removed: removed, gameRoom: gameRoom})
        });
    
        window.addEventListener('beforeunload', () => { removeMember(gameRoom.id) });
    
        return () => {
            removeMember(gameRoom.id);
            window.removeEventListener('beforeunload', () => { removeMember(gameRoom.id) });
            //socket.removeAllListeners();
        }
    }, [gameRoom]);


    function flipItem(index, key) {
        if (gameState.flippedKeys.length < 2
            && index !== gameState.flippedIndexes[gameState.flippedIndexes.length-1]
            && gameState.flippedIndexes.length !== gameState.items.length
            && gameState.started
            && gameState.memberId === gameState.activeMemberId) {

            setFlipped(
                gameRoom.id,
                [...gameState.flippedIndexes, index],
                [...gameState.flippedKeys, key]
            );
        }
    }

    return (
        <div className="game-room">
            <h1>{gameRoom.name}</h1>
            <p dangerouslySetInnerHTML={{__html: gameRoom.info}} />
            { !gameState.started && <Alert color="warning">Waiting for players...</Alert>}
            <div className="players">
                { gameState.members[gameRoom.id] && gameState.members[gameRoom.id].map((memberId, key, arr) => (
                    <div key={memberId} className={memberId === gameState.memberId ? "player active" : "player"}>
                        <h4>Player {key + 1}</h4>
                        <p>points: {gameState.points[memberId]}</p>
                    </div>
                )) }
            </div>
            <div className={"arena " + Difficulties[gameRoom.difficulty]}>
                { gameState.items && gameState.items.map((source, i) => {
                    return (
                        <div key={i} className={gameState.flippedIndexes && ~gameState.flippedIndexes.indexOf(i) ? 'item' : 'item flipped'} onClick={() => flipItem(i, source)}>
                            <div className="front face">
                                <img src={source} alt=""/>
                            </div>
                            <div className="back face">
                                <img src={backFace} alt=""/>
                            </div>
                        </div>
                    );
                }) }
            </div>
            <div className="sign-out" onClick={endGame}>
                <i className="fas fa-sign-out-alt"></i>
            </div>
            <Modal isOpen={gameState.gameEnded} winner={gameState.winner} memberId={gameState.memberId} />
        </div>
    );
}

MultiPlayerReducer.propTypes = {
    gameRoom: PropTypes.object.isRequired,
    timeEnded: PropTypes.bool.isRequired,
    endGame: PropTypes.func.isRequired,
    increaseTime: PropTypes.func.isRequired
};

export default MultiPlayerReducer;