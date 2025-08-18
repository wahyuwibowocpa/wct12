
export enum RoomName {
  Besar = "Besar",
  Sedang = "Sedang",
  Kecil = "Kecil",
}

export interface Booking {
  id: string;
  room: RoomName;
  date: string; // YYYY-MM-DD
  time: number; // 8-17
  bookedBy: string;
}

export type Notification = {
  message: string;
  type: 'success' | 'error';
};
