import React, { useState } from 'react';
import { bookAppointment } from '../services/api';
import { 
  X, 
  Stethoscope, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';

export const AppointmentModal = ({ isOpen, onClose, partners = [] }) => {
  const [partnerId, setPartnerId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('vaccination');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Filter for vet clinics or use first partner if none marked vet
  const vetPartners = partners.filter(p => p.type === 'vet' || p.type === 'shelter');
  const selectedPartner = partners.find(p => p.id === (partnerId || vetPartners[0]?.id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resolvedPartnerId = partnerId || vetPartners[0]?.id || partners[0]?.id;
    if (!resolvedPartnerId) {
      setError('Please select a veterinary clinic or partner.');
      return;
    }
    if (!fullName.trim() || !phone.trim() || !date) {
      setError('Please complete all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await bookAppointment({
        partner_id: resolvedPartnerId,
        full_name: fullName,
        phone,
        type,
        preferred_date: date,
        notes: notes || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to book appointment. Please check the date.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-4xl shadow-2xl p-6 sm:p-8 my-8 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-brand-surface text-brand-dark flex items-center justify-center hover:bg-brand-border transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-brand-dark font-display">
              Book Veterinary Care
            </h3>
            <p className="text-xs font-semibold text-brand-muted">
              Vaccination, sterilization & checkups with accredited clinics
            </p>
          </div>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center text-emerald-900">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h4 className="text-xl font-black font-display mb-1">Appointment Requested!</h4>
            <p className="text-xs text-emerald-800 leading-relaxed mb-6">
              Your appointment request for <strong>{type.toUpperCase()}</strong> on <strong>{date}</strong> has been received by <strong>{selectedPartner?.name || 'the clinic'}</strong>. They will call you to confirm your slot.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                onClose();
              }}
              className="px-6 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 shadow-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Clinic selection */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                Select Clinic / Partner *
              </label>
              <select
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
              >
                {vetPartners.length > 0 ? (
                  vetPartners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.city || 'Local Shelter / Clinic'})
                    </option>
                  ))
                ) : (
                  partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Visit Type */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                Service Required *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'vaccination', label: 'Vaccine' },
                  { id: 'sterilization', label: 'Spay/Neuter' },
                  { id: 'checkup', label: 'Checkup' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setType(s.id)}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition-colors ${
                      type === s.id
                        ? 'bg-brand-dark text-white border-brand-dark shadow-sm'
                        : 'bg-brand-surface text-brand-dark border-brand-border hover:bg-zinc-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                Preferred Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
              />
            </div>

            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Aarav Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                Notes / Pet Info (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="Pet breed, age, or specific health inquiries..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-emerald-600 text-white font-extrabold text-sm uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Confirming Booking...</span>
              ) : (
                <>
                  <Calendar className="w-4 h-4 text-sun-primary" />
                  <span>Request Clinic Appointment</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
