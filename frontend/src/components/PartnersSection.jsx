import React from 'react';
import { Building2, MapPin, Phone, Mail, Stethoscope, Sparkles } from 'lucide-react';

export const PartnersSection = ({ partners = [], onOpenAppointment }) => {
  return (
    <section id="partners" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold uppercase tracking-wider text-indigo-900 mb-3">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Certified Welfare Network</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark tracking-tight font-display">
            Our Shelter & Clinic Partners
          </h2>
          <p className="mt-3 text-base sm:text-lg text-brand-muted font-medium">
            Denly works exclusively with registered non-profits, ethical foster networks, and licensed veterinary clinics.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {partners.map((partner) => {
            const isVet = partner.type === 'vet';
            const isShelter = partner.type === 'shelter';

            return (
              <div
                key={partner.id}
                className="bg-brand-surface rounded-3xl p-6 border border-brand-border hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between text-left group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      isVet 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : isShelter
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-indigo-100 text-indigo-900'
                    }`}>
                      {partner.type}
                    </span>

                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-dark shadow-sm">
                      {isVet ? <Stethoscope className="w-4 h-4 text-emerald-600" /> : <Building2 className="w-4 h-4 text-amber-600" />}
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-brand-dark font-display mb-2 group-hover:text-amber-800 transition-colors">
                    {partner.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-brand-subtle mb-4 leading-relaxed line-clamp-3">
                    {partner.about || "Accredited welfare partner ensuring ethical pet placement, medical health checkups, and post-adoption guidance."}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-border space-y-2 text-xs text-brand-muted font-medium">
                  {partner.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-dark shrink-0" />
                      <span>{partner.address ? `${partner.address}, ` : ''}{partner.city}</span>
                    </div>
                  )}
                  {partner.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-brand-dark shrink-0" />
                      <span>{partner.phone}</span>
                    </div>
                  )}
                  {partner.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-brand-dark shrink-0" />
                      <span>{partner.email}</span>
                    </div>
                  )}

                  {isVet && (
                    <button
                      onClick={onOpenAppointment}
                      className="w-full mt-3 py-2.5 rounded-xl bg-brand-dark text-white font-bold text-xs uppercase tracking-wider hover:bg-brand-deep transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-sun-primary" />
                      <span>Book with this Clinic</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
