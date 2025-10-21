import React from 'react';

const AdoptionHero = () => {
  return (
    <section className="relative w-full h-40 md:h-56 flex items-center justify-center overflow-hidden rounded-b-lg shadow">
      {/* Background image (replace with actual image URL or prop) */}
      <img
        src="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80"
        alt="Happy pets waiting for adoption"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
        loading="eager"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-200/80 to-blue-200/80" aria-hidden="true" />
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 drop-shadow-lg mb-2">
          Available Pets for Adoption
        </h1>
        <p className="text-lg md:text-2xl text-gray-700 font-medium drop-shadow">
          Find your new best friend today!
        </p>
      </div>
    </section>
  );
};

export default AdoptionHero; 