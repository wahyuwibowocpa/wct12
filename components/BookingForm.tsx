
import React, { useState, useEffect } from 'react';
import { Booking, RoomName } from '../types';
import { HOURS } from '../constants';
import { UserIcon, RoomIcon, ClockIcon, CalendarIcon } from './Icons';

interface BookingFormProps {
  onAddBooking: (newBookingData: Omit<Booking, 'id'>) => void;
  rooms: RoomName[];
  bookingDefaults: Partial<Omit<Booking, 'id' | 'bookedBy'>> | null;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const BookingForm: React.FC<BookingFormProps> = ({ onAddBooking, rooms, bookingDefaults }) => {
  const [date, setDate] = useState<string>(getTodayString());
  const [room, setRoom] = useState<RoomName>(rooms[0]);
  const [time, setTime] = useState<number>(HOURS[0]);
  const [bookedBy, setBookedBy] = useState<string>('');
  
  useEffect(() => {
    if (bookingDefaults) {
      setDate(bookingDefaults.date || getTodayString());
      setRoom(bookingDefaults.room || rooms[0]);
      setTime(bookingDefaults.time || HOURS[0]);
    }
  }, [bookingDefaults, rooms]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookedBy.trim()) {
      alert('Please enter your name.');
      return;
    }
    onAddBooking({ room, date, time, bookedBy });
    setBookedBy('');
  };

  return (
    <div id="booking-form" className="bg-white p-6 rounded-lg shadow-md border border-slate-200 scroll-mt-8">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">New Booking</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="bookedBy" className="block text-sm font-medium text-slate-700 mb-1">
            Your Name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <UserIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              id="bookedBy"
              value={bookedBy}
              onChange={(e) => setBookedBy(e.target.value)}
              className="block w-full rounded-md border-slate-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., John Doe"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">
            Date
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <CalendarIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={getTodayString()}
              className="block w-full rounded-md border-slate-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="room" className="block text-sm font-medium text-slate-700 mb-1">
            Room
          </label>
          <div className="relative">
             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <RoomIcon className="h-5 w-5 text-slate-400" />
            </div>
            <select
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value as RoomName)}
              className="block w-full appearance-none rounded-md border-slate-300 pl-10 pr-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {rooms.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-slate-700 mb-1">
            Time Slot
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <ClockIcon className="h-5 w-5 text-slate-400" />
            </div>
            <select
              id="time"
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
              className="block w-full appearance-none rounded-md border-slate-300 pl-10 pr-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {`${h}:00 - ${h + 1}:00`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Book Room
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
