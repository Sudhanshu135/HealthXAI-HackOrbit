import React, { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-blue-100 fixed w-full h-16 z-10 top-0 text-center flex items-center justify-center shadow-md">
      <div className="w-full text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-600">Health X AI</h1>
      </div>
    </nav>
  );
}
