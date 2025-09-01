import React from 'react';

export function Badge({ children, variant = 'default', ...props }: { children: React.ReactNode; variant?: 'default' | 'secondary' | 'outline' | 'destructive'; } & React.HTMLAttributes<HTMLSpanElement>) {
  let color = 'bg-gray-200 text-gray-800';
  if (variant === 'default') color = 'bg-blue-200 text-blue-800';
  if (variant === 'secondary') color = 'bg-green-200 text-green-800';
  if (variant === 'outline') color = 'border border-blue-800 text-blue-800';
  if (variant === 'destructive') color = 'bg-red-200 text-red-800';
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`} {...props}>{children}</span>;
}
