import React, { useState } from 'react';
import { GALLERY_MOMENTS } from '../services/mockData';
import { Heart, Maximize2, X, Sparkles } from 'lucide-react';

export const GallerySection = () => {
  const [selectedMoment, setSelectedMoment] = useState(null);

  return (
    <section id="gallery" className="py-20 bg-brand-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sun-100 border border-sun-300 text-xs font-bold uppercase tracking-wider text-brand-dark mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Forever Home Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark tracking-tight font-display">
            We love to play & thrive
          </h2>
          <p className="mt-3 text-base sm:text-lg text-brand-muted font-medium">
            Glimpses into the daily adventures, goofy nap spots, and joyful moments of Denly adoptees.
          </p>
        </div>

        {/* Gallery Grid (Faithful to the photo collage layout in the reference) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERY_MOMENTS.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setSelectedMoment(item)}
              className={`group relative rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover cursor-pointer bg-white transition-all duration-300 hover:-translate-y-1 ${
                index === 0 ? 'sm:col-span-2 lg:col-span-1 aspect-[4/3] lg:aspect-[3/4]' : 'aspect-[4/3]'
              }`}
            >
              <img
                src={item.image_url}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

              {/* Inspect Button on hover */}
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur text-brand-dark flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                <Maximize2 className="w-4 h-4" />
              </div>

              {/* Caption info */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[11px] font-black uppercase tracking-wider text-sun-primary block mb-1">
                  {item.daysAdopted}
                </span>
                <h3 className="text-lg font-black font-display leading-tight mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-white/80 font-medium">
                  {item.pet}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedMoment && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedMoment(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-white rounded-4xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMoment(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-[4/3] w-full bg-black">
              <img
                src={selectedMoment.image_url}
                alt={selectedMoment.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 bg-white text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-600">
                  {selectedMoment.daysAdopted}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-500">
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  Adopted with Denly
                </span>
              </div>
              <h3 className="text-2xl font-black text-brand-dark font-display mb-2">
                {selectedMoment.title}
              </h3>
              <p className="text-sm text-brand-muted">
                Featuring: <strong className="text-brand-dark">{selectedMoment.pet}</strong>. Every adoption creates an inspiring story of loyalty and friendship.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
