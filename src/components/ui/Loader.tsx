import React from 'react';

export const Loader: React.FC = () => (
  <div className="flex justify-center items-center p-12">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
  </div>
);
