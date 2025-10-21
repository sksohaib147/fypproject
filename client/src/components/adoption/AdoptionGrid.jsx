import React from 'react';
import AdoptionPetCard from './AdoptionPetCard';

// Placeholder skeleton
const PetCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-4 animate-pulse flex flex-col h-full">
    <div className="w-full h-40 bg-gray-200 rounded mb-3" />
    <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
    <div className="h-4 bg-gray-100 rounded w-1/2 mb-1" />
    <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
    <div className="flex gap-1 mb-2">
      <div className="h-4 w-10 bg-gray-200 rounded-full" />
      <div className="h-4 w-12 bg-gray-200 rounded-full" />
    </div>
    <div className="flex gap-2 mt-auto">
      <div className="h-8 w-1/2 bg-gray-200 rounded" />
      <div className="h-8 w-1/2 bg-gray-200 rounded" />
    </div>
  </div>
);

const AdoptionGrid = ({ pets = [], loading = false, onViewDetails, onAdopt, onEditListing, showAdoptButton }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {loading
        ? Array.from({ length: 6 }).map((_, i) => <PetCardSkeleton key={i} />)
        : pets.map(pet => (
            <AdoptionPetCard
              key={pet._id || pet.id}
              pet={pet}
              image={pet.image}
              name={pet.name}
              age={pet.age}
              breed={pet.breed}
              location={pet.location}
              tags={pet.tags}
              onViewDetails={() => onViewDetails(pet)}
              onAdopt={() => onAdopt && onAdopt(pet)}
              onEditListing={() => onEditListing && onEditListing(pet)}
              showAdoptButton={showAdoptButton}
            />
          ))}
    </div>
  );
};

export default AdoptionGrid; 