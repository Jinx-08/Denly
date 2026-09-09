import React from 'react';
import { Heart, MapPin, ShieldCheck } from 'lucide-react';

const getPetImageUrl = (pet) => {
  if (pet.image_url && !pet.image_url.includes('picsum.photos')) {
    return pet.image_url;
  }
  const name = (pet.name || '').toLowerCase();
  const breed = (pet.breed || '').toLowerCase();
  const species = (pet.species || '').toLowerCase();

  if (name.includes('rocky') || breed.includes('indie') || breed.includes('desi')) {
    return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('bruno') || breed.includes('labrador')) {
    return 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('luna') || breed.includes('beagle')) {
    return 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('simba') || breed.includes('shorthair')) {
    return 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('coco') || breed.includes('persian')) {
    return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80';
  }
  if (species === 'bird' || name.includes('kiwi')) {
    return 'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&w=800&q=80';
  }
  if (species === 'rabbit' || breed.includes('dutch')) {
    return 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=800&q=80';
  }
  if (species === 'cat') {
    return 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80';
  }
  return pet.image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80';
};

export const PetCard = ({ pet, onSelectPet, isFavorite, onToggleFavorite }) => {
  const isAvailable = pet.status === 'available' || !pet.status;
  const resolvedImage = getPetImageUrl(pet);

  return (
    <div className="bg-white rounded-3xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 border border-brand-border/80 flex flex-col justify-between group text-left relative overflow-hidden">
      
      {/* Top Media Area */}
      <div>
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-brand-surface mb-4">
          <img
            src={resolvedImage}
            alt={pet.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm ${
              isAvailable 
                ? 'bg-emerald-500/90 text-white' 
                : pet.status === 'pending'
                ? 'bg-amber-500/90 text-white'
                : 'bg-zinc-600/90 text-white'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              {pet.status || 'Available'}
            </span>
          </div>

          {/* Favorite toggle button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(pet.id);
            }}
            aria-label="Save to favorites"
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-sm flex items-center justify-center text-brand-dark hover:scale-110 active:scale-95 transition-all"
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'text-rose-500 fill-rose-500' : 'text-brand-dark hover:text-rose-500'
              }`} 
            />
          </button>
        </div>

        {/* Pet Name & Breed */}
        <div className="mb-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl font-black text-brand-dark tracking-tight font-display group-hover:text-amber-800 transition-colors">
              {pet.name}
            </h3>
            {pet.age_months && (
              <span className="text-xs font-bold text-brand-muted bg-brand-surface px-2.5 py-1 rounded-full border border-brand-border">
                {pet.age_months >= 12 
                  ? `${Math.floor(pet.age_months / 12)}y ${pet.age_months % 12 ? (pet.age_months % 12) + 'm' : ''}`
                  : `${pet.age_months}m old`
                }
              </span>
            )}
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
            {pet.breed || pet.species}
          </p>
        </div>

        {/* Friendly description snippet */}
        <p className="text-xs sm:text-sm text-brand-subtle line-clamp-2 mb-3 leading-relaxed">
          {pet.description || "A wonderful companion searching for a warm, caring Indian home with love to share."}
        </p>

        {/* Tags with colored indicator dots */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sun-100/70 text-brand-dark text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {pet.species}
          </span>

          {pet.is_vaccinated && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/60">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Vaccinated
            </span>
          )}

          {pet.is_sterilized && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 text-[11px] font-bold border border-indigo-200/60">
              Sterilized
            </span>
          )}

          {pet.gender && pet.gender !== 'unknown' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[11px] font-bold capitalize">
              {pet.gender}
            </span>
          )}
        </div>

        {/* Shelter and City (e.g. Pune, Mumbai, Delhi) */}
        {pet.partner_id && (
          <div className="flex items-center gap-1.5 text-xs text-brand-muted mb-4">
            <MapPin className="w-3.5 h-3.5 text-brand-dark shrink-0" />
            <span className="truncate">{pet.partner_id.name || 'Certified Rescue Shelter'}{pet.partner_id.city ? ` · ${pet.partner_id.city}, India` : ''}</span>
          </div>
        )}
      </div>

      {/* Bottom Row: Indian Rupee Adoption fee + Paw Stamp + CTA button */}
      <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted block">
            Adoption Fee
          </span>
          <span className="text-sm sm:text-base font-black text-brand-dark">
            {pet.fee || "₹0 (Free Adoption)"}
          </span>
        </div>

        {/* Cute Golden Paw Stamp */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sun-100 text-sun-500 flex items-center justify-center" title="Denly Verified Companion">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a3 3 0 0 0-3 3c0 .35.06.68.17.99A3.001 3.001 0 0 0 6 9a3 3 0 0 0 3 3c.35 0 .68-.06.99-.17A4.996 4.996 0 0 0 12 14c.73 0 1.42-.16 2.01-.44.31.27.72.44 1.17.44a3 3 0 0 0 3-3 3.001 3.001 0 0 0-3.17-3.01A3.001 3.001 0 0 0 15 5a3 3 0 0 0-3-3zm-4 13c-2.21 0-4 1.79-4 4a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3c0-2.21-1.79-4-4-4H8z"/>
            </svg>
          </div>

          <button
            onClick={() => onSelectPet({ ...pet, image_url: resolvedImage })}
            className="px-4 py-2 rounded-full bg-brand-dark text-white font-extrabold text-xs uppercase tracking-wider hover:bg-brand-deep transition-all group-hover:bg-sun-primary group-hover:text-brand-dark shadow-sm"
          >
            Details
          </button>
        </div>
      </div>

    </div>
  );
};
