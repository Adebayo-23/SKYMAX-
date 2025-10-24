import React from 'react';

// Omit the DOM onSelect attribute from HTMLAttributes so our `onSelect` prop
// can be typed as (date: Date) => void without colliding with the native
// DOM event handler type.
type CalendarProps = { selected: Date; onSelect: (date: Date) => void } & Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>;

export function Calendar({ selected, onSelect, ...props }: CalendarProps) {
  // Placeholder calendar: just shows today's date and a button to select it
  return (
    <div {...props}>
      <div className="mb-2">Selected: {selected.toLocaleDateString()}</div>
      <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => onSelect(new Date())}>Select Today</button>
    </div>
  );
}
