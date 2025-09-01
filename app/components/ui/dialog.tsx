import React, { useState } from 'react';

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode; }) {
  return open ? <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">{children}</div> : null;
}

export function DialogTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode; }) {
  return <>{children}</>;
}

export function DialogContent({ children }: { children: React.ReactNode; }) {
  return <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">{children}</div>;
}

export function DialogHeader({ children }: { children: React.ReactNode; }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode; }) {
  return <h3 className="font-bold text-lg mb-2">{children}</h3>;
}

export function DialogDescription({ children }: { children: React.ReactNode; }) {
  return <p className="text-gray-500 mb-2">{children}</p>;
}

export function DialogFooter({ children }: { children: React.ReactNode; }) {
  return <div className="mt-4 flex justify-end">{children}</div>;
}
