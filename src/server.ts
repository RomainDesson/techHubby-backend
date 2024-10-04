import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { findOrCreateRoom } from './utils/findOrCreateRoom';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const rooms: { [roomId: string]: string[] } = {};
const users: { [socketId: string]: { username: string, interests: string[] } } = {};

app.get('/', (req: Request, res: Response) => {
  res.send('Socket.IO server is running!');
});

io.on('connection', (socket) => {

  let roomId: string;

  socket.emit('connectedUsers', Object.keys(users).length)

  socket.on('joinRoom', (username: string, interests: string[]) => {
    users[socket.id] = { username, interests };
    roomId = findOrCreateRoom(rooms, socket.id);
    socket.join(roomId);

    const usersInRoom = rooms[roomId].map(id => users[id]);

    io.to(roomId).emit('userJoined', usersInRoom);

    socket.on('typing', (senderId: string, isTyping: boolean) => {
      io.to(roomId).emit('typing', senderId, isTyping);
    })

    socket.on('sendMessage', (message: string, senderId: string) => {
      io.to(roomId).emit('receiveMessage', message, senderId);
    });

    socket.on('disconnect', () => {
      io.to(roomId).emit('userDisconnected', users[socket.id].username)
      rooms[roomId] = rooms[roomId]?.filter(id => id !== socket.id);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      } else {
        socket.to(roomId).emit('message', `Utilisateur ${socket.id} a quitté le salon.`);
      }
    });
  });

  
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Serveur Socket.IO en écoute sur le port ${PORT}`);
});
