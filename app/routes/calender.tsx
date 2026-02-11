import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useEffect, useState } from "react";
import useIsClient from "~/hooks/useIsClient";

export default function CalendarPage() {
  const isClient = useIsClient();
  const [date, setDate] = useState<Date | null>(null);
  const handleChange = (value: unknown) => {
    // react-calendar may pass Date or an array of Dates; ensure we set a Date
    if (value instanceof Date) {
      setDate(value);
    } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
      setDate(value[0]);
    }
  };

  useEffect(() => {
    if (isClient) setDate(new Date());
  }, [isClient]);

  return (
    <div className="p-4 text-white bg-black min-h-screen">
      <h2 className="text-2xl mb-4">🗓️ Your Calendar</h2>
      {date ? (
        <>
          <ReactCalendar onChange={handleChange} value={date} />
          <p className="mt-4">Selected Date: {date.toDateString()}</p>
        </>
      ) : (
        <p className="mt-4">Loading calendar…</p>
      )}
    </div>
  );
}
