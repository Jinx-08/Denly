import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  User, 
  Calendar, 
  LogOut, 
  Menu, 
  X, 
  FileText, 
  ShieldCheck, 
  PlusCircle,
  Stethoscope,
  PawPrint
} from 'lucide-react';

export const Navbar = ({ 
  onOpenAuth, 
  onOpenDashboard, 
  onOpenAppointment, 
  onOpenCareResources,
  applicationCount = 0 
}) => {
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-sun-primary shadow-sm border-b border-sun-hover/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo - Compact, clean & sleek */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-brand-dark flex items-center justify-center text-sun-primary shadow-sm group-hover:scale-105 transition-transform">
              <PawPrint className="w-4 h-4 fill-sun-primary" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-brand-dark font-display">
              DENLY
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <a 
              href="#catalog" 
              className="px-4 py-2 rounded-full font-bold text-sm text-brand-dark hover:bg-black/10 transition-colors"
            >
              Find a Pet
            </a>
            <Link 
              to="/guides"
              className="px-4 py-2 rounded-full font-bold text-sm text-brand-dark hover:bg-black/10 transition-colors"
            >
              Care & Guides
            </Link>
            <button 
              onClick={onOpenAppointment}
              className="px-4 py-2 rounded-full font-bold text-sm text-brand-dark hover:bg-black/10 transition-colors flex items-center gap-1.5"
            >
              <Stethoscope className="w-4 h-4 text-brand-dark" />
              Book Clinic
            </button>
            <a 
              href="#partners" 
              className="px-4 py-2 rounded-full font-bold text-sm text-brand-dark hover:bg-black/10 transition-colors"
            >
              Shelters & Vets
            </a>
            <a 
              href="#gallery" 
              className="px-4 py-2 rounded-full font-bold text-sm text-brand-dark hover:bg-black/10 transition-colors"
            >
              Happy Tails
            </a>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick appointment CTA */}
            <button
              onClick={onOpenAppointment}
              className="px-4 py-2.5 rounded-full bg-white text-brand-dark font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-white/90 transition-all border border-brand-dark/10 hover:shadow"
            >
              Clinic Visit
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenDashboard}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-dark text-white font-bold text-sm hover:bg-brand-deep transition-colors shadow-md"
                >
                  <User className="w-4 h-4 text-sun-primary" />
                  <span>{user.full_name || user.email?.split('@')[0]}</span>
                  {role === 'partner' && (
                    <span className="bg-sun-primary text-brand-dark text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                      Partner
                    </span>
                  )}
                  {applicationCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
                      {applicationCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2.5 rounded-full hover:bg-black/10 text-brand-dark transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-dark text-white font-bold text-sm shadow-md hover:bg-brand-deep transition-all hover:scale-105"
              >
                <User className="w-4 h-4 text-sun-primary" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <button
                onClick={onOpenDashboard}
                className="p-2 rounded-full bg-brand-dark text-sun-primary"
              >
                <User className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-black/10 text-brand-dark hover:bg-black/15 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-sun-primary border-t border-black/10 px-4 pt-3 pb-6 space-y-2">
          <a
            href="#catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl font-bold text-brand-dark hover:bg-black/10"
          >
            Find a Pet
          </a>
          <Link
            to="/guides"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl font-bold text-brand-dark hover:bg-black/10"
          >
            Care & Guides
          </Link>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenAppointment(); }}
            className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-brand-dark hover:bg-black/10 flex items-center justify-between"
          >
            <span>Book Clinic Visit</span>
            <Stethoscope className="w-4 h-4" />
          </button>
          <a
            href="#partners"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl font-bold text-brand-dark hover:bg-black/10"
          >
            Shelters & Vets
          </a>
          <a
            href="#gallery"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl font-bold text-brand-dark hover:bg-black/10"
          >
            Happy Tails
          </a>

          <div className="pt-4 border-t border-black/10 flex flex-col gap-2">
            {user ? (
              <>
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenDashboard(); }}
                  className="w-full py-3 rounded-xl bg-brand-dark text-white font-bold text-sm flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4 text-sun-primary" />
                  Dashboard ({user.full_name || user.email})
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); logout(); }}
                  className="w-full py-2.5 rounded-xl bg-black/10 text-brand-dark font-bold text-sm"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
                className="w-full py-3 rounded-xl bg-brand-dark text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <User className="w-4 h-4 text-sun-primary" />
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
