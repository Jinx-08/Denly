import React from 'react';
import { HeartHandshake, Stethoscope, Sparkles } from 'lucide-react';

export const BenefitsSection = () => {
  const benefits = [
    {
      id: 'variety',
      title: 'Diverse Companions',
      subtitle: 'Extensive Selection of Rescues',
      desc: 'Browse hundreds of vetted dogs, cats, rabbits, and small friends from licensed non-profit shelters with transparent personality assessments.',
      bgColor: 'bg-pill-peachBg',
      borderColor: 'border-pill-peachBorder',
      textColor: 'text-pill-peachText',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.996 1 1.157-.365 2.035-1.08 2.604-1.928"/>
          <path d="M14 5.172C14 3.782 15.577 2.679 17.5 3c2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.996 1-1.157-.365-2.035-1.08-2.604-1.928"/>
          <path d="M7 14c1.66 0 3-1.34 3-3 0-1.3-1.5-3-3-3s-3 1.7-3 3c0 1.66 1.34 3 3 3z"/>
          <path d="M17 14c1.66 0 3-1.34 3-3 0-1.3-1.5-3-3-3s-3 1.7-3 3c0 1.66 1.34 3 3 3z"/>
          <path d="M12 14c-3.5 0-6 2.5-6 6h12c0-3.5-2.5-6-6-6z"/>
        </svg>
      )
    },
    {
      id: 'health',
      title: 'Certified Health',
      subtitle: 'Complete Medical Screening',
      desc: 'All pets receive required vaccinations, microchipping, and sterilization by accredited veterinarians prior to joining your family.',
      bgColor: 'bg-pill-mintBg',
      borderColor: 'border-pill-mintBorder',
      textColor: 'text-pill-mintText',
      icon: (
        <Stethoscope className="w-8 h-8" />
      )
    },
    {
      id: 'love',
      title: 'Raised with Love',
      subtitle: 'Cared for & Socialized',
      desc: 'Our shelter partners nurture every animal with individualized attention, healthy socialization routines, and gentle foster environments.',
      bgColor: 'bg-pill-roseBg',
      borderColor: 'border-pill-roseBorder',
      textColor: 'text-pill-roseText',
      icon: (
        <HeartHandshake className="w-8 h-8" />
      )
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sun-50 border border-sun-200 text-xs font-bold uppercase tracking-wider text-brand-dark mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>The Denly Standard</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark tracking-tight font-display">
            Why families choose our friends
          </h2>
          <p className="mt-3 text-base sm:text-lg text-brand-muted font-medium">
            We hold animal rescue to the highest standard of health, transparency, and ethical adoption.
          </p>
        </div>

        {/* 3 Prominent Feature Cards (Matching the reference layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((item) => (
            <div
              key={item.id}
              className="bg-brand-surface rounded-3xl p-8 border border-brand-border hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col items-start text-left group"
            >
              {/* Pastel Icon Box */}
              <div
                className={`w-16 h-16 rounded-2xl ${item.bgColor} ${item.borderColor} ${item.textColor} border flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}
              >
                {item.icon}
              </div>

              {/* Card Titles */}
              <h3 className="text-xl font-extrabold text-brand-dark tracking-tight font-display mb-1">
                {item.title}
              </h3>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3">
                {item.subtitle}
              </p>

              {/* Description */}
              <p className="text-sm text-brand-subtle font-medium leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
