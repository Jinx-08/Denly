import React, { useState, useEffect } from 'react';
import { PetCard } from './PetCard';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Friends', icon: '🐾' },
  { id: 'dog', label: 'Dogs', icon: '🐶' },
  { id: 'cat', label: 'Cats', icon: '🐱' },
  { id: 'hamster', label: 'Hamsters', icon: '🐹' },
  { id: 'other', label: 'Small Pets', icon: '🐰' },
];

export const PetCatalogSection = ({ 
  pets = [], 
  loading = false, 
  onSelectPet, 
  activeCategory = 'all', 
  onCategoryChange,
  onSearch,
  searchQuery = '',
  vaccinatedFilter = false,
  sterilizedFilter = false,
  onToggleVaccinated,
  onToggleSterilized
}) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('denly_favs')) || [];
    } catch {
      return [];
    }
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const toggleFavorite = (petId) => {
    setFavorites((prev) => {
      const next = prev.includes(petId) 
        ? prev.filter(id => id !== petId) 
        : [...prev, petId];
      localStorage.setItem('denly_favs', JSON.stringify(next));
      return next;
    });
  };

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(pets.length / itemsPerPage));
  const currentPets = pets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, vaccinatedFilter, sterilizedFilter]);

  return (
    <section id="catalog" className="relative py-20 bg-sun-primary overflow-hidden">
      
      {/* Decorative cloud-scalloped top curves */}
      <div className="absolute top-0 left-0 right-0 h-8 -mt-4 overflow-hidden pointer-events-none">
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-full text-white fill-current">
          <path d="M0,0 C150,40 350,-40 500,20 C650,-20 850,40 1000,10 C1100,-10 1150,20 1200,0 L1200,40 L0,40 Z"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark tracking-tight font-display">
            Animal Catalog
          </h2>
          <p className="mt-2 text-base sm:text-lg text-brand-dark/80 font-medium">
            Find your next companion from verified rescue shelters and foster families.
          </p>
        </div>

        {/* Filter Bar: Category Pills (matching the reference design pills) */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-5 py-2.5 rounded-full font-extrabold text-sm transition-all duration-200 flex items-center gap-2 shadow-sm ${
                  isActive
                    ? 'bg-brand-dark text-sun-primary shadow-md scale-105'
                    : 'bg-white/80 backdrop-blur hover:bg-white text-brand-dark border border-brand-dark/10'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Medical Filters Row */}
        <div className="max-w-3xl mx-auto mb-10 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-3xl shadow-card border border-white/60 flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input
              type="text"
              placeholder="Search by breed, name, or personality..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-brand-surface border border-brand-border text-sm font-medium text-brand-dark placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-dark focus:bg-white transition-all"
            />
          </div>

          {/* Quick Filter Toggles */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onToggleVaccinated}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${
                vaccinatedFilter
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-surface text-brand-muted border border-brand-border hover:text-brand-dark'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Vaccinated</span>
            </button>

            <button
              onClick={onToggleSterilized}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${
                sterilizedFilter
                  ? 'bg-indigo-600 text-white'
                  : 'bg-brand-surface text-brand-muted border border-brand-border hover:text-brand-dark'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sterilized</span>
            </button>
          </div>
        </div>

        {/* Cards Grid or Loading / Empty States */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-5 animate-pulse shadow-sm h-96">
                <div className="w-full aspect-[4/3] rounded-2xl bg-zinc-200 mb-4"></div>
                <div className="h-6 bg-zinc-200 rounded-full w-2/3 mb-2"></div>
                <div className="h-4 bg-zinc-200 rounded-full w-1/2 mb-4"></div>
                <div className="h-10 bg-zinc-200 rounded-full w-full"></div>
              </div>
            ))}
          </div>
        ) : currentPets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {currentPets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onSelectPet={onSelectPet}
                isFavorite={favorites.includes(pet.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur rounded-3xl p-12 text-center max-w-lg mx-auto shadow-card">
            <div className="w-16 h-16 rounded-full bg-sun-100 text-brand-dark flex items-center justify-center mx-auto mb-4 font-display text-2xl">
              🐶
            </div>
            <h3 className="text-xl font-black text-brand-dark font-display mb-2">
              No matching friends found
            </h3>
            <p className="text-sm text-brand-subtle mb-6">
              Try adjusting your search criteria or clearing filters to see all available companions.
            </p>
            <button
              onClick={() => {
                onCategoryChange('all');
                onSearch('');
              }}
              className="px-6 py-2.5 rounded-full bg-brand-dark text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 hover:bg-brand-deep shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-sun-primary" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}

        {/* Pagination & Carousel Controls (faithful to reference image layout) */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="w-10 h-10 rounded-full bg-brand-dark text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:scale-105 transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-sun-primary" />
              </button>

              {/* Pagination Dots */}
              <div className="flex items-center gap-2 px-2">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`h-2.5 rounded-full transition-all ${
                      currentPage === idx + 1
                        ? 'w-7 bg-brand-dark'
                        : 'w-2.5 bg-brand-dark/30 hover:bg-brand-dark/50'
                    }`}
                    aria-label={`Page ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="w-10 h-10 rounded-full bg-brand-dark text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:scale-105 transition-all"
              >
                <ChevronRight className="w-5 h-5 text-sun-primary" />
              </button>
            </div>

            <span className="text-xs font-black uppercase tracking-wider text-brand-dark/70">
              Page {currentPage} of {totalPages} ({pets.length} companions)
            </span>
          </div>
        )}

      </div>
    </section>
  );
};
