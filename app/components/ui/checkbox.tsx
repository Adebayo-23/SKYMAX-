import React from 'react';

export function Checkbox({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: () => void }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onCheckedChange}
      className="w-4 h-4 rounded border-gray-300 focus:ring-blue-500"
    />
  );
}
