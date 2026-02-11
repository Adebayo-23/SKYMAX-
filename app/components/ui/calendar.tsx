import React from 'react';
import useIsClient from '../../hooks/useIsClient';

// Omit the DOM onSelect attribute from HTMLAttributes so our `onSelect` prop
// can be typed as (date: Date) => void without colliding with the native
// DOM event handler type.
type CalendarProps = { selected: Date; onSelect: (date: Date) => void } & Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>;

export function Calendar({ selected, onSelect, ...props }: CalendarProps) {
  const isClient = useIsClient();

  // Placeholder calendar: shows selected date (ISO on server, localized on client)
  return (
    <div {...props}>
      <div className="mb-2">
        Selected: {selected ? (isClient ? selected.toLocaleDateString() : selected.toISOString().slice(0, 10)) : 'None'}
      </div>
      <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => onSelect(new Date())}>Select Today</button>
    </div>
  );
}
