import React from 'react';

export const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-12 text-red-500">
    <p className="font-semibold">Error: {message}</p>
  </div>
);
