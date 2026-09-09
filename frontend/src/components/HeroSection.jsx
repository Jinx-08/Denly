import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Heart, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react';

const PREVIEW_SLIDES = [
  {
    category: 'Indies & Dogs',
    tagline: 'Loyal Desi Rescues',
    name: 'Bruno the Indie',
    heroImage: '/hero-dog.jpg',
    thumbImage: '/hero-dog.jpg',
    species: 'dog',
    city: 'Pune Shelter',
    status: 'Ready for Home'
  },
  {
    category: 'Desi Billis',
    tagline: 'Gentle Purrs',
    name: 'Simba the Indian Cat',
    heroImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=85',
    thumbImage: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80',
    species: 'cat',
    city: 'Mumbai Foster',
    status: 'Ready for Home'
  },
  {
    category: 'Small Friends',
    tagline: 'Gentle Puffs of Joy',
    name: 'Pepper the Bunny',
    heroImage: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=1000&q=85',
    thumbImage: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=400&q=80',
    species: 'other',
    city: 'Bengaluru Shelter',
    status: 'Ready for Home'
  }
];

export const HeroSection = ({ onSelectCategory, onOpenAppointment }) => {
  const [slideIndex, setSlideIndex] = useState(0);

  const prevSlide = () => {
    setSlideIndex((prev) => (prev === 0 ? PREVIEW_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setSlideIndex((prev) => (prev === 0 ? PREVIEW_SLIDES.length - 1 : prev + 1) % PREVIEW_SLIDES.length);
  };

  const currentSlide = PREVIEW_SLIDES[slideIndex];

  return (
    <section className="relative bg-sun-primary pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden">
      {/* Decorative subtle background paw patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-10 -right-10 w-96 h-96 rounded-full bg-white blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-sun-hover blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Heading, description, CTA, and interactive mini preview card */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Mission badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-brand-dark/10 shadow-sm text-xs font-bold text-brand-dark uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-dark" />
              <span>Compassionate Adoption & Vet Care</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-dark tracking-tight leading-[1.08] font-display">
              Your new best friend, <br />
              <span className="relative inline-block">
                ready for a warm home
                <svg className="absolute -bottom-2 left-0 w-full text-brand-dark/20 -z-10" height="12" viewBox="0 0 300 12" fill="none">
                  <path d="M2 9C70 3 230 3 298 9" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-brand-dark/80 max-w-xl font-medium leading-relaxed">
              Ethical rescue platform connecting verified shelters, veterinary clinics, and loving families. Adopt, vaccinate, and care with complete transparency.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#catalog"
                className="px-8 py-4 rounded-full bg-brand-dark text-white font-extrabold text-base shadow-float hover:bg-brand-deep transition-all hover:scale-105 inline-flex items-center gap-2"
              >
                <span>Meet Our Friends</span>
                <ArrowRight className="w-5 h-5 text-sun-primary" />
              </a>

              <button
                onClick={onOpenAppointment}
                className="px-6 py-4 rounded-full bg-white/90 backdrop-blur text-brand-dark font-bold text-base hover:bg-white transition-all shadow-sm border border-brand-dark/10 inline-flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span>Book Clinic Visit</span>
              </button>
            </div>

            {/* Interactive Preview Card */}
            <div className="pt-6">
              <div className="inline-flex items-center gap-4 bg-white/95 backdrop-blur-md p-3 rounded-3xl shadow-card border border-white/60">
                {/* Arrow navigation */}
                <button
                  onClick={prevSlide}
                  className="w-8 h-8 rounded-full bg-sun-primary hover:bg-sun-hover text-brand-dark flex items-center justify-center transition-colors shadow-sm"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Card thumbnail & info */}
                <button
                  onClick={() => onSelectCategory(currentSlide.species)}
                  className="flex items-center gap-3.5 pr-2 text-left group"
                >
                  <img
                    src={currentSlide.thumbImage}
                    alt={currentSlide.name}
                    className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-brand-dark group-hover:text-amber-800 transition-colors uppercase tracking-wider">
                      <span>{currentSlide.category}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-sm font-bold text-brand-subtle">{currentSlide.name}</p>
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Available to Adopt
                    </span>
                  </div>
                </button>

                <button
                  onClick={nextSlide}
                  className="w-8 h-8 rounded-full bg-sun-primary hover:bg-sun-hover text-brand-dark flex items-center justify-center transition-colors shadow-sm"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Slider dots */}
              <div className="flex items-center gap-1.5 pl-6 pt-2">
                {PREVIEW_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSlideIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === slideIndex ? 'w-6 bg-brand-dark' : 'w-2 bg-brand-dark/20'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual composition */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            {/* Ambient sun glow behind image */}
            <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-white/30 blur-2xl -z-0"></div>

            {/* Central hero pet visual */}
            <div className="relative z-10 w-full max-w-md">
              
              {/* Pet photography card */}
              <div 
                onClick={() => onSelectCategory(currentSlide.species)}
                className="relative rounded-4xl overflow-hidden shadow-2xl border-4 border-white bg-brand-dark/10 aspect-[4/4.5] group cursor-pointer"
              >
                <img
                  src={currentSlide.heroImage}
                  alt={currentSlide.name}
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Vignette gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Location & Status Top Badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{currentSlide.city}</span>
                  </span>
                </div>

                {/* Bottom info text with ample right padding to avoid badge overlap */}
                <div className="absolute bottom-5 left-5 right-5 text-white pr-28 sm:pr-32">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sun-primary text-brand-dark text-[10px] font-black uppercase tracking-wider mb-1 shadow-sm">
                    <span>Featured Companion</span>
                  </div>
                  <p className="font-display font-black text-xl sm:text-2xl leading-tight">
                    {currentSlide.name}
                  </p>
                  <p className="text-xs text-white/90 font-medium line-clamp-1 mt-0.5">
                    Every adoption saves two lives: the pet you adopt & the next rescue.
                  </p>
                </div>
              </div>

              {/* Floating Trust Badge 1: Health checked */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-white p-3 sm:p-3.5 rounded-2xl shadow-float border border-brand-border flex items-center gap-3 animate-soft-pulse z-20">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-brand-dark">100% Screened</p>
                  <p className="text-[11px] font-medium text-brand-muted">Vaccinated & Vet-Checked</p>
                </div>
              </div>

              {/* Floating Trust Badge 2: Certified Adoptions */}
              <div className="absolute -bottom-4 -right-2 sm:-right-4 bg-brand-dark text-white p-3 sm:p-3.5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 z-20">
                <div className="w-10 h-10 rounded-xl bg-sun-primary text-brand-dark flex items-center justify-center font-black">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <p className="text-xs font-black text-sun-primary">134+ Adopted</p>
                  <p className="text-[11px] font-medium text-white/80">Found Forever Homes</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
