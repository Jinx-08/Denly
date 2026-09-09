import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Phone, Mail, MapPin, Sparkles, Stethoscope, PawPrint } from 'lucide-react';

export const Footer = ({ onOpenAppointment, onOpenCareResources }) => {
  return (
    <footer className="bg-brand-dark text-white pt-16 pb-12 border-t border-brand-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10 text-left">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-sun-primary text-brand-dark flex items-center justify-center font-bold group-hover:scale-105 transition-transform shadow-sm">
                <PawPrint className="w-4 h-4 fill-brand-dark" />
              </div>
              <span className="text-xl font-black font-display tracking-tight text-white">DENLY</span>
            </Link>
            
            <p className="text-xs sm:text-sm text-brand-muted max-w-sm leading-relaxed">
              Denly is a mission-driven platform dedicated to animal welfare, partnering with certified rescue shelters, foster homes, and veterinary clinics to ensure every pet finds a safe, loving den.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-white/70">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Non-Profits
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                Ethical Adoption Only
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-sun-primary font-display">
              Explore
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-brand-muted">
              <li>
                <a href="#catalog" className="hover:text-white transition-colors">
                  Find a Pet
                </a>
              </li>
              <li>
                <a href="#partners" className="hover:text-white transition-colors">
                  Partner Shelters
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-white transition-colors">
                  Happy Tails Gallery
                </a>
              </li>
              <li>
                <Link 
                  to="/guides"
                  className="hover:text-white transition-colors text-left block"
                >
                  Care & Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Veterinary Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-sun-primary font-display">
              Healthcare
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-brand-muted">
              <li>
                <button 
                  onClick={onOpenAppointment} 
                  className="hover:text-white transition-colors text-left flex items-center gap-1"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Vaccination Booking</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenAppointment} 
                  className="hover:text-white transition-colors text-left"
                >
                  Low-Cost Spay / Neuter
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenAppointment} 
                  className="hover:text-white transition-colors text-left"
                >
                  Routine Health Checkups
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenCareResources} 
                  className="hover:text-white transition-colors text-left"
                >
                  Vaccine Schedules
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-sun-primary font-display">
              Partner & Support
            </h4>
            <div className="space-y-2 text-xs font-semibold text-brand-muted">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sun-primary" />
                <span>care@denly.in</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-sun-primary" />
                <span>+91 90000 11111 / +91 (20) 2612-DENLY</span>
              </p>
              <p className="text-[11px] text-brand-muted leading-relaxed pt-1">
                Connecting shelters, NGOs, and vet clinics across Pune, Mumbai, Delhi-NCR & Bengaluru.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted">
          <p>© {new Date().getFullYear()} Denly Platform. All rights reserved.</p>
          <p className="flex items-center gap-1 text-white/80">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for every animal in need.
          </p>
        </div>

      </div>
    </footer>
  );
};
