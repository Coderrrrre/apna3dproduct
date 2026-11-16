import React from 'react';
import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      toastOptions={{
        style: {
          background: '#0B1727',
          color: '#FFFFFF',
          border: '1px solid #1F6E72',
          borderRadius: '9999px',
          fontSize: '13px',
          fontWeight: 600,
        },
      }}
    />
  );
}
