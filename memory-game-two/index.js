'use strict';

const express = require('express');
const http = require('http');
const socket = require('socket.io');
const cors = require('cors');
const v1Routes = require('./routes/v1');

const app = express();
const server = http.Server(app);
const io = socket(server, { cors: {
    origin: "http://localhost:5173"
  }});
const PORT = 5001;

let members = new Array(12).fill([]);
let roomStatuses = new Array(12).fill(true);

io.on('connection', socket => {
    socket.on('REQUEST_MEMBERS', () => {
        io.emit('GET_MEMBERS', members);
    });
    socket.on('ADD_MEMBER', data => {
        members[data] = [...members[data], socket.id];
        io.emit('GET_MEMBERS', members);
    });
    socket.on('REMOVE_MEMBER', data => {
        let removed = false;
        if (~members[data].indexOf(socket.id)) {
            members[data].splice(members[data].indexOf(socket.id), 1);
            removed = true;
        }
        io.emit('GET_MEMBERS', members);
        if (removed) {
            io.emit('REMOVED', true);
        }
    });
    socket.on('SET_ITEMS', data => {
        io.emit('GET_ITEMS', data);
    });
    socket.on('SET_FLIPPED', data => {
        io.emit('GET_FLIPPED', data);
    });
    socket.on('SET_ROOM_STATUSES', data => {
        roomStatuses[data.room] = data.status;
        io.emit('GET_ROOM_STATUSES', roomStatuses);
    });
    socket.on('REQUEST_ROOM_STATUSES', () => {
        io.emit('GET_ROOM_STATUSES', roomStatuses);
    });
});

app.use(cors({
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200
}));

app.use('/v1', v1Routes);

server.listen(PORT, "0.0.0.0", console.log(`Listening to ${PORT}!`));