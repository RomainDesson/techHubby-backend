import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Liste des salons
const rooms: { [roomId: string]: string[] } = {};

app.get('/', (req: Request, res: Response) => {
  res.send('Socket.IO server is running!');
});

function findOrCreateRoom(socketId: string): string {
  
  for (const roomId in rooms) {
    if (rooms[roomId].length < 2) {
      rooms[roomId].push(socketId);
      return roomId;
    }
  }

  const newRoomId = `room-${socketId}`;
  rooms[newRoomId] = [socketId];
  return newRoomId;
}

io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté', socket.id);

  const roomId = findOrCreateRoom(socket.id);
  socket.join(roomId);
  console.log(`Utilisateur ${socket.id} rejoint le salon ${roomId}`);

  socket.to(roomId).emit('message', `Utilisateur ${socket.id} a rejoint le salon.`);

  socket.on('message', (message: string) => {
    console.log(`Message reçu de ${socket.id} dans le salon ${roomId}: `, message);
    io.to(roomId).emit('message', message);
  });

  // Gérer la déconnexion
  socket.on('disconnect', () => {
    console.log(`Utilisateur ${socket.id} s'est déconnecté du salon ${roomId}`);

    // Retirer l'utilisateur du salon
    rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);

    // Si le salon est vide, le supprimer
    if (rooms[roomId].length === 0) {
      delete rooms[roomId];
      console.log(`Le salon ${roomId} est maintenant vide et a été supprimé.`);
    } else {
      // Informer les autres utilisateurs du salon que l'utilisateur est parti
      socket.to(roomId).emit('message', `Utilisateur ${socket.id} a quitté le salon.`);
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Serveur Socket.IO en écoute sur le port ${PORT}`);
});
