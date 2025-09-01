import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useState } from "react";

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());

  return (
    <div className="p-4 text-white bg-black min-h-screen">
      <h2 className="text-2xl mb-4">🗓️ Your Calendar</h2>
      <Calendar onChange={setDate} value={date} />
      <p className="mt-4">Selected Date: {date.toDateString()}</p>
    </div>
  );
}
