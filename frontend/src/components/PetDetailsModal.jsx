import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { submitApplication } from '../services/api';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Heart, 
  Send, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export const PetDetailsModal = ({ pet, onClose, onOpenAuth, onApplicationSubmitted }) => {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!pet) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!phone.trim()) {
      setError('Please provide a valid phone number for shelter contact.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await submitApplication(pet.id, phone, message);
      setSuccess(true);
      if (onApplicationSubmitted) onApplicationSubmitted();
    } catch (err) {
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-4xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur text-brand-dark flex items-center justify-center hover:bg-white shadow-md transition-all hover:scale-105"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
          
          {/* Left Column: Image & Quick Stats */}
          <div className="md:col-span-5 bg-brand-surface p-6 flex flex-col justify-between border-r border-brand-border">
            <div>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-sm mb-4">
                <img
                  src={pet.image_url || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80"}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-brand-dark/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  {pet.status || 'Available'}
                </div>
              </div>

              <div className="space-y-2.5 text-left text-xs font-semibold text-brand-subtle">
                <div className="flex justify-between py-1.5 border-b border-brand-border/60">
                  <span className="text-brand-muted uppercase font-extrabold tracking-wider text-[10px]">Species</span>
                  <span className="capitalize text-brand-dark font-bold">{pet.species}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-border/60">
                  <span className="text-brand-muted uppercase font-extrabold tracking-wider text-[10px]">Breed</span>
                  <span className="text-brand-dark font-bold">{pet.breed || 'Rescue Mix'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-border/60">
                  <span className="text-brand-muted uppercase font-extrabold tracking-wider text-[10px]">Age</span>
                  <span className="text-brand-dark font-bold">
                    {pet.age_months 
                      ? `${Math.floor(pet.age_months / 12)}y ${pet.age_months % 12 ? (pet.age_months % 12) + 'm' : ''}` 
                      : 'Young Adult'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-border/60">
                  <span className="text-brand-muted uppercase font-extrabold tracking-wider text-[10px]">Gender</span>
                  <span className="capitalize text-brand-dark font-bold">{pet.gender || 'Unknown'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-border/60">
                  <span className="text-brand-muted uppercase font-extrabold tracking-wider text-[10px]">Size</span>
                  <span className="capitalize text-brand-dark font-bold">{pet.size || 'Medium'}</span>
                </div>
              </div>
            </div>

            {/* Medical status badges */}
            <div className="mt-6 pt-4 border-t border-brand-border flex flex-col gap-2 text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted">Medical Screening</span>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  pet.is_vaccinated ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {pet.is_vaccinated ? 'Vaccinated' : 'Pending Vaccines'}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  pet.is_sterilized ? 'bg-indigo-100 text-indigo-800' : 'bg-zinc-100 text-zinc-600'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {pet.is_sterilized ? 'Sterilized' : 'Spay/Neuter Planned'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Bio & Adoption Application Form */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <h2 className="text-3xl font-black text-brand-dark font-display">
                  {pet.name}
                </h2>
                <span className="text-lg font-black text-brand-dark bg-sun-primary px-3 py-1 rounded-full">
                  {pet.fee || '₹0 (Free Adoption)'}
                </span>
              </div>

              {/* Shelter & City */}
              {pet.partner_id && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted mb-4">
                  <MapPin className="w-3.5 h-3.5 text-brand-dark shrink-0" />
                  <span>Cared for by {pet.partner_id.name || 'Certified Rescue Shelter'}, {pet.partner_id.city}</span>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-muted mb-1.5">
                  About {pet.name}
                </h4>
                <p className="text-sm text-brand-subtle leading-relaxed whitespace-pre-line">
                  {pet.description || `${pet.name} is a lovely companion with a warm heart looking for a safe and caring home. Socialized, playful, and ready to meet prospective adopters.`}
                </p>
              </div>
            </div>

            {/* Application Section */}
            <div className="pt-6 border-t border-brand-border">
              {success ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-900">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Application Submitted Successfully!</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    The shelter has received your inquiry for <strong>{pet.name}</strong>. Their coordinator will reach out via phone to arrange a meet & greet.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-5 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-brand-dark font-display flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Apply to Adopt {pet.name}</span>
                    </h4>
                    {!user && (
                      <button
                        type="button"
                        onClick={onOpenAuth}
                        className="text-xs font-bold text-amber-600 hover:underline"
                      >
                        Sign in first
                      </button>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                      Your Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                      Message / Living Environment (Optional)
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Tell the shelter a little about your home, routine, or experience with pets..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark focus:bg-white outline-none resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-full bg-brand-dark text-white font-extrabold text-sm uppercase tracking-wider hover:bg-brand-deep transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Sending Application...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-sun-primary" />
                        <span>Submit Adoption Request</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
