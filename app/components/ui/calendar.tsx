import React from 'react';

export function Calendar({ selected, onSelect, ...props }: { selected: Date; onSelect: (date: Date) => void; } & React.HTMLAttributes<HTMLDivElement>) {
  // Placeholder calendar: just shows today's date and a button to select it
  return (
    <div {...props}>
      <div className="mb-2">Selected: {selected.toLocaleDateString()}</div>
      <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => onSelect(new Date())}>Select Today</button>
    </div>
  );
}
