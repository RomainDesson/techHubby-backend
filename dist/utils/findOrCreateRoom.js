"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOrCreateRoom = findOrCreateRoom;
function findOrCreateRoom(rooms, socketId) {
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
