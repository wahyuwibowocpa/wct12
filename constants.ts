
import { RoomName } from './types';

export const ROOMS: RoomName[] = [RoomName.Besar, RoomName.Sedang, RoomName.Kecil];

// Booking hours from 8 AM to 5 PM (17:00)
export const HOURS: number[] = Array.from({ length: 10 }, (_, i) => i + 8); // Creates [8, 9, ..., 17]
