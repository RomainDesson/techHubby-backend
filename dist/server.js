"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { findOrCreateRoom } = require('./utils/findOrCreateRoom');
const cors = require('cors');
const app = express();
app.use(cors());
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ["GET", "POST"]
    }
});
const rooms = {};
const users = {};
app.get('/', (req, res) => {
    res.send('Socket.IO server is running!');
});
io.on('connection', (socket) => {
    let roomId;
    socket.emit('connectedUsers', Object.keys(users).length);
    socket.on('joinRoom', (username, interests) => {
        users[socket.id] = { username, interests };
        roomId = findOrCreateRoom(rooms, socket.id);
        if (!roomId)
            return;
        socket.join(roomId);
        const usersInRoom = rooms[roomId].map(id => users[id]);
        io.to(roomId).emit('userJoined', usersInRoom);
        socket.on('typing', (senderId, isTyping) => {
            io.to(roomId).emit('typing', senderId, isTyping);
        });
        socket.on('sendMessage', (message, senderId) => {
            io.to(roomId).emit('receiveMessage', message, senderId);
        });
        socket.on('disconnect', () => {
            var _a;
            io.to(roomId).emit('userDisconnected', users[socket.id].username);
            if (!roomId)
                return;
            rooms[roomId] = (_a = rooms[roomId]) === null || _a === void 0 ? void 0 : _a.filter(id => id !== socket.id);
            if (rooms[roomId].length === 0) {
                delete rooms[roomId];
            }
            else {
                socket.to(roomId).emit('message', `Utilisateur ${socket.id} a quitté le salon.`);
            }
        });
    });
});
server.listen(PORT, () => {
    console.log(`Serveur Socket.IO en écoute sur le port ${PORT}`);
});
