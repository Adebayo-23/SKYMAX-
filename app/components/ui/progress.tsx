import React from 'react';

export function Progress({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`w-full bg-gray-200 rounded ${className}`} style={{ height: '8px' }}>
      <div
        className="bg-blue-500 h-full rounded"
        style={{ width: `${value}%`, transition: 'width 0.3s' }}
      />
    </div>
  );
}
