"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173", // URL du client Vite
        methods: ["GET", "POST"]
    }
});
app.get('/', (req, res) => {
    res.send('Socket.IO server is running!');
});
// Gérer les connexions Socket.IO
io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté', socket.id);
    // Recevoir et émettre des messages
    socket.on('message', (message) => {
        console.log('Message reçu : ', message);
        io.emit('message', message); // Réémet à tous les clients connectés
    });
    // Gérer la déconnexion
    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté');
    });
});
// Démarrer le serveur
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Serveur Socket.IO en écoute sur le port ${PORT}`);
});
