export function findOrCreateRoom(rooms: { [roomId: string]: string[] }, socketId: string): string {

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