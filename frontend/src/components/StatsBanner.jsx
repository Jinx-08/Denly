import React from 'react';
import { Heart, Building2, Calendar, ShieldCheck } from 'lucide-react';

export const StatsBanner = ({ stats = {} }) => {
  const statItems = [
    {
      id: 'adopted',
      number: stats.petsAdopted || 134,
      suffix: '+',
      label: 'Pets Adopted',
      desc: 'Found warm forever dens',
      icon: <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />,
      color: 'bg-rose-50 border-rose-200'
    },
    {
      id: 'available',
      number: stats.petsAvailable || 26,
      suffix: '',
      label: 'Waiting for Love',
      desc: 'Screened & ready now',
      icon: <ShieldCheck className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50 border-amber-200'
    },
    {
      id: 'partners',
      number: stats.totalPartners || 12,
      suffix: '',
      label: 'Shelters & Vets',
      desc: 'Accredited rescue partners',
      icon: <Building2 className="w-5 h-5 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-200'
    },
    {
      id: 'appointments',
      number: stats.totalAppointments || 215,
      suffix: '+',
      label: 'Clinic Visits',
      desc: 'Vaccinations & spay/neuter',
      icon: <Calendar className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200'
    }
  ];

  return (
    <section className="py-14 bg-white border-y border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {statItems.map((item) => (
            <div 
              key={item.id} 
              className="p-6 rounded-3xl bg-brand-surface border border-brand-border flex flex-col items-center text-center hover:shadow-soft transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-2xl ${item.color} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl sm:text-4xl font-black text-brand-dark font-display tracking-tight">
                  {item.number}
                </span>
                <span className="text-xl font-black text-amber-600">
                  {item.suffix}
                </span>
              </div>
              <p className="text-sm font-black text-brand-dark mt-1 font-display">
                {item.label}
              </p>
              <p className="text-xs text-brand-muted mt-0.5">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
