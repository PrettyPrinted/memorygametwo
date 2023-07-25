import React, { Component, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'reactstrap';
import Modal from '../components/Modal';
import Difficulties from '../constants/Difficulties';
import { init } from '../scripts/init';
import {
    addMember, getMembers, removeMember,
    setItems as socketSetItems, getItems, setFlipped, getFlipped,
    isRemoved, setRoomStatuses
} from '../socket';
import backFace from '../images/grooming-1801287_640.png';

function MultiPlayerFunction({ gameRoom, endGame }) {
    // const [state, setState] = useState({
    //     flippedIndexes: [],
    //     flippedKeys: [],
    //     items: [],
    //     gameEnded: false,
    //     members: [],
    //     memberId: '',
    //     started: false,
    //     activeMemberId: '',
    //     points: {},
    //     winner: ''
    // });
    const [flippedIndexes, setFlippedIndexes] = useState([]);
    const [flippedKeys, setFlippedKeys] = useState([]);
    const [items, setItems] = useState([]);
    const [gameEnded, setGameEnded] = useState(false);
    const [members, setMembers] = useState([]);
    const [memberId, setMemberId] = useState('');
    const [started, setStarted] = useState(false);
    const [activeMemberId, setActiveMemberId] = useState('');
    const [points, setPoints] = useState({});
    const [winner, setWinner] = useState('');

    useEffect(() => {
        const { items } = init(gameRoom.difficulty);
        socketSetItems(gameRoom.id, items);
        getItems(data => {
            console.log("getting items")
            if (data.room === gameRoom.id) {
                setItems(data.items);
            }
        });

        getFlipped(async data => {
            if (data.room = gameRoom.id) {
                setFlippedIndexes(data.flippedIndexes);
                console.log("index")
                console.log(data.flippedIndexes)
                setFlippedKeys(data.flippedKeys);

                if (flippedKeys.length === 2) {
                    setTimeout(async () => {
                        if (flippedKeys[0] === flippedKeys[1]) {
                            let updatedPoints = points[activeMemberId] + 2;
                            setPoints(prevPoints => { return { ...prevPoints, [activeMemberId]: updatedPoints } });
                            if (flippedIndexes.length === items.length) {
                                const points = points;
                                const winner = Object.keys(points).reduce((a, b) => {
                                    return points[a] > points[b] ? a : (points[a] < points[b] ? b : '');
                                });
                                setGameEnded(true);
                                setWinner(winner);
                                setTimeout(() => {
                                    setRoomStatuses(gameRoom.id, true);
                                    endGame();
                                }, 5000);
                            }
                        } else {
                            let flippedIndexes = flippedIndexes;
                            flippedIndexes.splice(-2, 2);
                            // await this.setStateAsync({ flippedIndexes: flippedIndexes });
                            setFlippedIndexes(flippedIndexes);
                            /* Change Active Member */
                            let members_var = members[gameRoom.id];
                            let nextActive = members_var.indexOf(activeMemberId) + 1;
                            if (nextActive >= members_var.length) {
                                nextActive = 0;
                            }
                            setActiveMemberId(members_var[nextActive]);
                        }
                        setFlippedKeys([]);
                    }, 1000);
                }
            }
        });

        addMember(gameRoom.id);
        getMembers(data => {
            /* set active member id */
            if (activeMemberId) {
                let members_var = members[gameRoom.id];
                let nextActive = members_var.indexOf(activeMemberId);
                if (nextActive >= data[gameRoom.id].length) {
                    nextActive = 0;
                }
                setActiveMemberId(data[gameRoom.id][nextActive]);
            } else {
                setActiveMemberId(data[gameRoom.id][0]);
            }

            /* get all members */
            setMembers(data);

            /* set initial points */
            if (gameRoom.id in members) {
                for (let memberId of members[gameRoom.id]) {
                    if (!points[memberId]) {
                        setPoints(prevPoints => { return { ...prevPoints, [memberId]: 0 } });
                    }
                }
            }

            /* set current member */
            if (!memberId) {
                setMemberId(data[gameRoom.id][data[gameRoom.id].length-1]);
            }

            /* start if all members arrived */
            if (data[gameRoom.id].length === gameRoom.members) {
                setStarted(true);
                setRoomStatuses(gameRoom.id, false);
            }
        });

        isRemoved(removed => {
            if (removed && members[gameRoom.id].length === 1 && started) {
                setGameEnded(true);
                setWinner(members[gameRoom.id][0]);
                setTimeout(() => {
                    setRoomStatuses(gameRoom.id, true);
                    endGame();
                }, 5000);
            }
        });

        window.addEventListener('beforeunload', () => { removeMember(gameRoom.id) });
        
        return () => {
            removeMember(gameRoom.id);
            window.removeEventListener('beforeunload', () => { removeMember(gameRoom.id) });
        }
    }, []);

    function flipItem(index, key) {
        console.log("flip item")
        
        console.table({
            flippedIndexes: flippedIndexes,
            flippedKeys: flippedKeys,
            index: index,
            key: key,
            started: started,
            memberId: memberId,
            activeMemberId: activeMemberId
        })
        console.log(members)
        if (flippedKeys.length < 2 //true
            && index !== flippedIndexes[flippedIndexes.length-1]
            && flippedIndexes.length !== items.length // true
            && started
            && memberId === activeMemberId) {
            
            console.log("flipping")

            setFlipped(
                gameRoom.id,
                [...flippedIndexes, index],
                [...flippedKeys, key]
            );
        }
    }
      
    return (
        <div className="game-room">
            <h1>{gameRoom.name}</h1>
            <p dangerouslySetInnerHTML={{__html: gameRoom.info}} />
            { !started && <Alert color="warning">Waiting for players...</Alert>}
            <div className="players">
                { members[gameRoom.id] && members[gameRoom.id].map((memberId, key, arr) => (
                    <div key={memberId} className={memberId === memberId ? "player active" : "player"}>
                        <h4>Player {key + 1}</h4>
                        <p>points: {points[memberId]}</p>
                    </div>
                )) }
            </div>
            <div className={"arena " + Difficulties[gameRoom.difficulty]}>
                { items && items.map((source, i) => {
                    return (
                        <div key={i} className={flippedIndexes && ~flippedIndexes.indexOf(i) ? 'item' : 'item flipped'} onClick={() => flipItem(i, source)}>
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
            <Modal isOpen={gameEnded} winner={winner} memberId={memberId} />
        </div>
    );
}




    

MultiPlayerFunction.propTypes = {
    gameRoom: PropTypes.object.isRequired,
    timeEnded: PropTypes.bool.isRequired,
    endGame: PropTypes.func.isRequired,
    increaseTime: PropTypes.func.isRequired
};

export default MultiPlayerFunction;