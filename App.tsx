
import React, { useState, useEffect, useCallback } from 'react';
import { Booking, RoomName, Notification as NotificationType } from './types';
import { ROOMS } from './constants';
import BookingForm from './components/BookingForm';
import BookingView from './components/BookingView';
import { LogoIcon } from './components/Icons';

const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Initial mock data
const initialBookings: Booking[] = [
  { id: '1', room: RoomName.Besar, date: getTodayString(), time: 9, bookedBy: 'Alice' },
  { id: '2', room: RoomName.Sedang, date: getTodayString(), time: 11, bookedBy: 'Bob' },
  { id: '3', room: RoomName.Kecil, date: getTodayString(), time: 9, bookedBy: 'Charlie' },
];

type BookingDefaults = Partial<Omit<Booking, 'id' | 'bookedBy'>>;

const App: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [bookingDefaults, setBookingDefaults] = useState<BookingDefaults | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAddBooking = useCallback((newBookingData: Omit<Booking, 'id'>) => {
    const isConflict = bookings.some(
      (booking) =>
        booking.room === newBookingData.room &&
        booking.date === newBookingData.date &&
        booking.time === newBookingData.time
    );

    if (isConflict) {
      setNotification({
        message: 'This room is already booked for the selected date and time.',
        type: 'error',
      });
      return;
    }

    const newBooking: Booking = {
      ...newBookingData,
      id: new Date().getTime().toString(),
    };
    
    setBookings((prevBookings) => [...prevBookings, newBooking].sort((a,b) => a.time - b.time || a.room.localeCompare(b.room)));
    setNotification({ message: 'Room booked successfully!', type: 'success' });
  }, [bookings]);

  const handleDeleteBooking = useCallback((bookingId: string) => {
    setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== bookingId));
     setNotification({ message: 'Booking canceled.', type: 'success' });
  }, []);

  const handleSlotSelect = useCallback((defaults: BookingDefaults) => {
    setBookingDefaults(defaults);
    const form = document.getElementById('booking-form');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const NotificationComponent: React.FC<NotificationType> = ({ message, type }) => {
    const baseClasses = 'p-4 rounded-md text-white text-center mb-4 shadow-lg transition-all duration-300';
    const typeClasses = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    return (
      <div className={`${baseClasses} ${typeClasses}`}>
        {message}
      </div>
    );
  };

  const getWeekDates = (startDate: string): string[] => {
    const dates: string[] = [];
    const start = new Date(startDate);
     // Adjust for timezone offset to prevent day-before issues
    start.setMinutes(start.getMinutes() + start.getTimezoneOffset());

    for (let i = 0; i < 7; i++) {
        const nextDate = new Date(start);
        nextDate.setDate(start.getDate() + i);
        dates.push(nextDate.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedDate);
  const weeklyBookings = bookings.filter(b => weekDates.includes(b.date));


  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <LogoIcon className="h-10 w-10 text-blue-600"/>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Meeting Room Booking</h1>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {notification && <NotificationComponent {...notification} />}
              <BookingForm 
                onAddBooking={handleAddBooking} 
                rooms={ROOMS} 
                bookingDefaults={bookingDefaults}
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <BookingView
              startDate={selectedDate}
              onDateChange={setSelectedDate}
              bookings={weeklyBookings}
              onDeleteBooking={handleDeleteBooking}
              onSlotSelect={handleSlotSelect}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
