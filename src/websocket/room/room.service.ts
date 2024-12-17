import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomService {
  private rooms: Map<string, Set<string>> = new Map();

  joinRoom(roomId: string, userId: string) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }

    // Use non-null assertion operator (!) since `set` ensures it exists.
    this.rooms.get(roomId)!.add(userId);
  }

  leaveRoom(roomId: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(userId);

      // Remove the room from the map if it's empty
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  getRoomParticipants(roomId: string): string[] {
    // Use a fallback empty array if room does not exist
    return Array.from(this.rooms.get(roomId) || []);
  }
}
