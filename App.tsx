import React, { useState, useEffect, useCallback } from 'react';
import {
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  orderBy,
  where,
  getDocs,
} from 'firebase/firestore';
import { bookingsCollectionRef, isFirebaseConfigured } from './firebase';
import { Booking, RoomName, Notification as NotificationType } from './types';
import { ROOMS } from './constants';
import BookingForm from './components/BookingForm';
import BookingView from './components/BookingView';
import { LogoIcon } from './components/Icons';

const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

type BookingDefaults = Partial<Omit<Booking, 'id' | 'bookedBy'>>;

const App: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [bookingDefaults, setBookingDefaults] = useState<BookingDefaults | null>(null);

  useEffect(() => {
    // Load bookings from either Firebase or localStorage
    if (isFirebaseConfigured && bookingsCollectionRef) {
      // Real-time listener for bookings from Firestore
      const q = query(bookingsCollectionRef, orderBy('time'), orderBy('room'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const bookingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Booking[];
        setBookings(bookingsData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching bookings:", error);
        setNotification({ message: 'Failed to connect to the booking database.', type: 'error' });
        setLoading(false);
      });
      return () => unsubscribe(); // Cleanup listener
    } else {
      // Fallback to localStorage
      try {
        const storedBookings = localStorage.getItem('bookings');
        if (storedBookings) {
          setBookings(JSON.parse(storedBookings));
        }
      } catch (error) {
        console.error("Failed to load bookings from localStorage", error);
        setNotification({ message: 'Could not load local bookings.', type: 'error' });
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage only if Firebase is not configured and bookings change
    if (!isFirebaseConfigured) {
       try {
        localStorage.setItem('bookings', JSON.stringify(bookings));
      } catch (error) {
        console.error("Failed to save bookings to localStorage", error);
      }
    }
  }, [bookings]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAddBooking = useCallback(async (newBookingData: Omit<Booking, 'id'>) => {
    try {
      if (isFirebaseConfigured && bookingsCollectionRef) {
        // Firebase logic
        const { room, date, time } = newBookingData;
        const conflictQuery = query(
            bookingsCollectionRef, 
            where('room', '==', room), 
            where('date', '==', date), 
            where('time', '==', time)
        );
        const querySnapshot = await getDocs(conflictQuery);
        if (!querySnapshot.empty) {
             setNotification({ message: 'This room is already booked for the selected date and time.', type: 'error' });
             return;
        }
        await addDoc(bookingsCollectionRef, newBookingData);
        setNotification({ message: 'Room booked successfully!', type: 'success' });
      } else {
        // LocalStorage logic
        const conflict = bookings.find(b => 
            b.room === newBookingData.room && 
            b.date === newBookingData.date && 
            b.time === newBookingData.time
        );
        if (conflict) {
            setNotification({ message: 'This room is already booked for the selected date and time.', type: 'error' });
            return;
        }
        const bookingWithId: Booking = { ...newBookingData, id: new Date().toISOString() };
        setBookings(prev => [...prev, bookingWithId].sort((a,b) => a.time - b.time || a.room.localeCompare(b.room)));
        setNotification({ message: 'Room booked successfully!', type: 'success' });
      }
    } catch (error) {
        console.error("Error adding booking: ", error);
        setNotification({ message: 'Failed to book room. Please try again.', type: 'error' });
    }
  }, [bookings]);

  const handleDeleteBooking = useCallback(async (bookingId: string) => {
    try {
      if (isFirebaseConfigured && bookingsCollectionRef) {
        // Firebase logic
        const bookingDocRef = doc(bookingsCollectionRef, bookingId);
        await deleteDoc(bookingDocRef);
        setNotification({ message: 'Booking canceled.', type: 'success' });
      } else {
        // LocalStorage logic
        setBookings(prev => prev.filter(b => b.id !== bookingId));
        setNotification({ message: 'Booking canceled.', type: 'success' });
      }
    } catch (error) {
      console.error("Error deleting booking: ", error);
      setNotification({ message: 'Failed to cancel booking.', type: 'error' });
    }
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
      <div className={`${baseClasses} ${typeClasses}`}>{message}</div>
    );
  };
  
  const getWeekDates = (startDate: string): string[] => {
    const dates: string[] = [];
    const start = new Date(startDate);
    start.setMinutes(start.getMinutes() + start.getTimezoneOffset());
    for (let i = 0; i < 7; i++) {
        const nextDate = new Date(start);
        nextDate.setDate(start.getDate() + i);
        dates.push(nextDate.toISOString().split('T')[0]);
    }
    return dates;
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="text-center">
                <LogoIcon className="h-12 w-12 text-blue-600 animate-spin mx-auto"/>
                <p className="text-xl font-semibold text-slate-700 mt-4">Loading Bookings...</p>
                <p className="text-slate-500">Connecting to the database.</p>
            </div>
        </div>
    );
  }

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