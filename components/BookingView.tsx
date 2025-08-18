
import React from 'react';
import { Booking, RoomName } from '../types';
import { ROOMS, HOURS } from '../constants';
import { TrashIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

type BookingDefaults = Partial<Omit<Booking, 'id' | 'bookedBy'>>;

interface BookingViewProps {
  startDate: string;
  onDateChange: (date: string) => void;
  bookings: Booking[];
  onDeleteBooking: (bookingId: string) => void;
  onSlotSelect: (defaults: BookingDefaults) => void;
}

const roomColors: Record<RoomName, { bg: string; border: string; text: string; hover: string }> = {
  [RoomName.Besar]: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', hover: 'hover:bg-blue-200' },
  [RoomName.Sedang]: { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800', hover: 'hover:bg-indigo-200' },
  [RoomName.Kecil]: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800', hover: 'hover:bg-purple-200' },
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const formatDateHeader = (dateStr: string): { day: string; date: string } => {
    const date = new Date(dateStr);
    // Adjust for timezone offset
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
};

const BookingView: React.FC<BookingViewProps> = ({ startDate, onDateChange, bookings, onDeleteBooking, onSlotSelect }) => {
    
    const getWeekDates = (start: string): string[] => {
        const dates: string[] = [];
        const startDate = new Date(start);
        startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
        for (let i = 0; i < 7; i++) {
            const nextDate = new Date(startDate);
            nextDate.setDate(startDate.getDate() + i);
            dates.push(nextDate.toISOString().split('T')[0]);
        }
        return dates;
    };

    const weekDates = getWeekDates(startDate);

    const changeWeek = (direction: 'prev' | 'next') => {
        const currentDate = new Date(startDate);
        currentDate.setMinutes(currentDate.getMinutes() + currentDate.getTimezoneOffset());
        const offset = direction === 'prev' ? -7 : 7;
        currentDate.setDate(currentDate.getDate() + offset);
        onDateChange(currentDate.toISOString().split('T')[0]);
    };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Weekly Schedule</h2>
        <div className="flex items-center gap-2">
            <button onClick={() => changeWeek('prev')} className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50" aria-label="Previous week">
                <ChevronLeftIcon className="h-5 w-5 text-slate-600" />
            </button>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <CalendarIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    min={getTodayString()}
                    className="block w-full rounded-md border-slate-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    aria-label="Select start date of the week"
                />
            </div>
             <button onClick={() => changeWeek('next')} className="p-2 rounded-md hover:bg-slate-100" aria-label="Next week">
                <ChevronRightIcon className="h-5 w-5 text-slate-600" />
            </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="grid gap-px bg-slate-200" style={{ gridTemplateColumns: 'minmax(4rem, auto) repeat(7, 1fr)', minWidth: '60rem' }}>
            {/* Header: Time + Dates */}
            <div className="bg-slate-50 sticky left-0 z-10 p-2"></div>
            {weekDates.map(dateStr => {
                const { day, date } = formatDateHeader(dateStr);
                const isToday = dateStr === getTodayString();
                return (
                    <div key={dateStr} className={`text-center p-2 ${isToday ? 'bg-blue-50' : 'bg-slate-50'}`}>
                        <p className={`font-semibold ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>{day}</p>
                        <p className={`text-sm ${isToday ? 'text-blue-500' : 'text-slate-500'}`}>{date}</p>
                    </div>
                )
            })}

            {/* Body: Time slots and bookings */}
            {HOURS.map(hour => (
                <React.Fragment key={hour}>
                    {/* Time Column */}
                    <div className="bg-slate-50 sticky left-0 z-10 flex items-center justify-center p-2">
                        <span className="text-sm font-semibold text-slate-600">{`${hour}:00`}</span>
                    </div>
                    {/* Day columns */}
                    {weekDates.map(date => {
                        return (
                            <div key={`${date}-${hour}`} className="bg-white p-1 min-h-[6rem]">
                                <div className="space-y-1 h-full flex flex-col">
                                    {ROOMS.map(room => {
                                        const booking = bookings.find(b => b.date === date && b.time === hour && b.room === room);
                                        const colors = roomColors[room];

                                        if (booking) {
                                            return (
                                                <div key={room} className={`p-1.5 rounded text-xs flex justify-between items-start flex-1 ${colors.bg} ${colors.border} ${colors.text} border`}>
                                                    <div>
                                                        <p className="font-bold">{room}</p>
                                                        <p className="truncate">{booking.bookedBy}</p>
                                                    </div>
                                                    <button onClick={() => onDeleteBooking(booking.id)} className="text-slate-500 hover:text-red-600 flex-shrink-0" aria-label={`Cancel booking for ${room} by ${booking.bookedBy}`}>
                                                        <TrashIcon className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )
                                        } else {
                                            return (
                                                <button key={room} onClick={() => onSlotSelect({ date, time: hour, room })} className={`p-1.5 rounded text-xs w-full text-left flex-1 ${colors.hover} bg-opacity-60 bg-slate-50 text-slate-400 transition-colors`}>
                                                    <span className="font-semibold text-slate-500">{room}:</span> Available
                                                </button>
                                            )
                                        }
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </React.Fragment>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BookingView;
