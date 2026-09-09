import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getMyApplications, 
  getPartnerApplications, 
  updateApplicationStatus,
  getMyAppointments,
  getPartnerAppointments,
  updateAppointmentStatus,
  createPet
} from '../services/api';
import { 
  X, 
  User, 
  FileText, 
  Calendar, 
  PlusCircle, 
  Check, 
  AlertCircle, 
  Clock, 
  Heart,
  Building2,
  CheckCircle2,
  XCircle,
  Stethoscope
} from 'lucide-react';

export const DashboardModal = ({ isOpen, onClose, onPetCreated }) => {
  const { user, role, logout } = useAuth();
  const isPartner = role === 'partner' || role === 'admin';
  const [activeTab, setActiveTab] = useState(isPartner ? 'partner-apps' : 'my-apps');

  // Applications & Appointments state
  const [applications, setApplications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  // New Pet Form state (for partners)
  const [petForm, setPetForm] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age_months: 12,
    gender: 'female',
    size: 'medium',
    is_vaccinated: true,
    is_sterilized: true,
    description: '',
    image_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
  });
  const [creatingPet, setCreatingPet] = useState(false);

  // Fetch relevant dashboard data
  const loadData = async () => {
    setLoading(true);
    setStatusMsg('');
    try {
      if (isPartner) {
        const [apps, appts] = await Promise.all([
          getPartnerApplications().catch(() => []),
          getPartnerAppointments().catch(() => []),
        ]);
        setApplications(Array.isArray(apps) ? apps : []);
        setAppointments(Array.isArray(appts) ? appts : []);
      } else {
        const [apps, appts] = await Promise.all([
          getMyApplications().catch(() => []),
          getMyAppointments().catch(() => []),
        ]);
        setApplications(Array.isArray(apps) ? apps : []);
        setAppointments(Array.isArray(appts) ? appts : []);
      }
    } catch (err) {
      console.warn('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, isPartner]);

  // Handle partner application approval/rejection
  const handleUpdateAppStatus = async (id, status) => {
    try {
      await updateApplicationStatus(id, status);
      setStatusMsg(`Application ${status} successfully!`);
      loadData();
    } catch (err) {
      setStatusMsg(`Failed to update application: ${err.message}`);
    }
  };

  // Handle partner appointment update
  const handleUpdateApptStatus = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      setStatusMsg(`Appointment marked as ${status}!`);
      loadData();
    } catch (err) {
      setStatusMsg(`Failed to update appointment: ${err.message}`);
    }
  };

  // Handle partner adding a new pet
  const handleCreatePetSubmit = async (e) => {
    e.preventDefault();
    setCreatingPet(true);
    setStatusMsg('');
    try {
      await createPet(petForm);
      setStatusMsg('New pet companion published successfully!');
      setPetForm({
        name: '',
        species: 'dog',
        breed: '',
        age_months: 12,
        gender: 'female',
        size: 'medium',
        is_vaccinated: true,
        is_sterilized: true,
        description: '',
        image_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
      });
      if (onPetCreated) onPetCreated();
    } catch (err) {
      setStatusMsg(`Error creating pet: ${err.message}`);
    } finally {
      setCreatingPet(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-4xl shadow-2xl p-6 sm:p-8 my-8 text-left max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-dark text-sun-primary flex items-center justify-center font-bold">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-brand-dark font-display">
                  {user.full_name || user.email}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  isPartner ? 'bg-indigo-100 text-indigo-900' : 'bg-sun-primary text-brand-dark'
                }`}>
                  {role}
                </span>
              </div>
              <p className="text-xs font-semibold text-brand-muted">
                {user.email} · Denly Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-brand-surface text-brand-dark flex items-center justify-center hover:bg-brand-border transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 py-4 border-b border-brand-border overflow-x-auto no-scrollbar">
          {isPartner ? (
            <>
              <button
                onClick={() => setActiveTab('partner-apps')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shrink-0 ${
                  activeTab === 'partner-apps'
                    ? 'bg-brand-dark text-white shadow-sm'
                    : 'bg-brand-surface text-brand-muted hover:bg-zinc-200'
                }`}
              >
                Incoming Applications ({applications.length})
              </button>
              <button
                onClick={() => setActiveTab('partner-appts')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shrink-0 ${
                  activeTab === 'partner-appts'
                    ? 'bg-brand-dark text-white shadow-sm'
                    : 'bg-brand-surface text-brand-muted hover:bg-zinc-200'
                }`}
              >
                Clinic Bookings ({appointments.length})
              </button>
              <button
                onClick={() => setActiveTab('new-pet')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'new-pet'
                    ? 'bg-sun-primary text-brand-dark shadow-sm'
                    : 'bg-brand-surface text-brand-muted hover:bg-zinc-200'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>List New Pet</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('my-apps')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shrink-0 ${
                  activeTab === 'my-apps'
                    ? 'bg-brand-dark text-white shadow-sm'
                    : 'bg-brand-surface text-brand-muted hover:bg-zinc-200'
                }`}
              >
                My Adoption Applications ({applications.length})
              </button>
              <button
                onClick={() => setActiveTab('my-appts')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shrink-0 ${
                  activeTab === 'my-appts'
                    ? 'bg-brand-dark text-white shadow-sm'
                    : 'bg-brand-surface text-brand-muted hover:bg-zinc-200'
                }`}
              >
                My Vet Appointments ({appointments.length})
              </button>
            </>
          )}
        </div>

        {/* Status notice */}
        {statusMsg && (
          <div className="my-3 p-3 rounded-xl bg-sun-50 border border-sun-300 text-brand-dark text-xs font-bold">
            {statusMsg}
          </div>
        )}

        {/* Tab Content Panels */}
        <div className="py-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-12 text-brand-muted text-sm font-semibold">
              Loading records...
            </div>
          ) : activeTab === 'my-apps' ? (
            applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div 
                    key={app.id} 
                    className="p-5 rounded-3xl bg-brand-surface border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-base text-brand-dark">
                          Application for Pet #{app.pet_id?.slice(0, 8)}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                          app.status === 'approved' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : app.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-brand-muted">
                        Submitted: {new Date(app.created_at).toLocaleDateString()} · Contact Phone: {app.phone}
                      </p>
                      {app.message && (
                        <p className="text-xs text-brand-subtle mt-2 italic bg-white p-2.5 rounded-xl border border-brand-border">
                          "{app.message}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-brand-border mx-auto mb-3" />
                <h4 className="font-bold text-brand-dark mb-1">No applications yet</h4>
                <p className="text-xs text-brand-muted">Browse the catalog and submit an application to meet a friend!</p>
              </div>
            )
          ) : activeTab === 'my-appts' ? (
            appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appt) => (
                  <div 
                    key={appt.id} 
                    className="p-5 rounded-3xl bg-brand-surface border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-base text-brand-dark capitalize">
                          {appt.type} Appointment
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                          appt.status === 'confirmed' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : appt.status === 'done'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {appt.status}
                        </span>
                      </div>
                      <p className="text-xs text-brand-muted">
                        Date: {appt.preferred_date} · Name: {appt.full_name} ({appt.phone})
                      </p>
                      {appt.notes && (
                        <p className="text-xs text-brand-subtle mt-1">{appt.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-brand-border mx-auto mb-3" />
                <h4 className="font-bold text-brand-dark mb-1">No appointments booked</h4>
                <p className="text-xs text-brand-muted">Book low-cost vaccinations or health checkups with our partners.</p>
              </div>
            )
          ) : activeTab === 'partner-apps' ? (
            applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div 
                    key={app.id} 
                    className="p-5 rounded-3xl bg-brand-surface border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-base text-brand-dark">
                          Applicant: {app.user_id?.full_name || 'Interested Adopter'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                          app.status === 'approved' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : app.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-brand-muted">
                        Phone: <strong className="text-brand-dark">{app.phone}</strong> · Pet ID: {app.pet_id?.slice(0, 8)}
                      </p>
                      {app.message && (
                        <p className="text-xs text-brand-subtle mt-2 bg-white p-3 rounded-xl border border-brand-border">
                          "{app.message}"
                        </p>
                      )}
                    </div>

                    {app.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleUpdateAppStatus(app.id, 'approved')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleUpdateAppStatus(app.id, 'rejected')}
                          className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-brand-border mx-auto mb-3" />
                <h4 className="font-bold text-brand-dark mb-1">No incoming applications yet</h4>
                <p className="text-xs text-brand-muted">Applications submitted for your listed pets will appear here.</p>
              </div>
            )
          ) : activeTab === 'partner-appts' ? (
            appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appt) => (
                  <div 
                    key={appt.id} 
                    className="p-5 rounded-3xl bg-brand-surface border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-base text-brand-dark capitalize">
                          {appt.type}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                          appt.status === 'confirmed' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : appt.status === 'done'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {appt.status}
                        </span>
                      </div>
                      <p className="text-xs text-brand-muted">
                        Patient / Owner: <strong className="text-brand-dark">{appt.full_name}</strong> ({appt.phone})
                      </p>
                      <p className="text-xs text-brand-muted">
                        Date: {appt.preferred_date}
                      </p>
                      {appt.notes && (
                        <p className="text-xs text-brand-subtle mt-1 italic">Notes: {appt.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {appt.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateApptStatus(appt.id, 'confirmed')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          Confirm
                        </button>
                      )}
                      {appt.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateApptStatus(appt.id, 'done')}
                          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          Mark Done
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-brand-border mx-auto mb-3" />
                <h4 className="font-bold text-brand-dark mb-1">No clinic bookings yet</h4>
              </div>
            )
          ) : (
            /* New Pet Listing Form for Partners */
            <form onSubmit={handleCreatePetSubmit} className="space-y-4 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Pet Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bella"
                    value={petForm.name}
                    onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Species *
                  </label>
                  <select
                    value={petForm.species}
                    onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="hamster">Hamster</option>
                    <option value="other">Small Pet / Bunny</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Breed
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Beagle Mix"
                    value={petForm.breed}
                    onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Age (Months)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={petForm.age_months}
                    onChange={(e) => setPetForm({ ...petForm, age_months: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Gender
                  </label>
                  <select
                    value={petForm.gender}
                    onChange={(e) => setPetForm({ ...petForm, gender: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl bg-brand-surface border border-brand-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={petForm.is_vaccinated}
                    onChange={(e) => setPetForm({ ...petForm, is_vaccinated: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-dark focus:ring-0"
                  />
                  <span className="text-xs font-bold text-brand-dark">Vaccinated</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-brand-surface border border-brand-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={petForm.is_sterilized}
                    onChange={(e) => setPetForm({ ...petForm, is_sterilized: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-dark focus:ring-0"
                  />
                  <span className="text-xs font-bold text-brand-dark">Sterilized (Spayed/Neutered)</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={petForm.image_url}
                  onChange={(e) => setPetForm({ ...petForm, image_url: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Personality & Health Description
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe temperament, favorite activities, and ideal home environment..."
                  value={petForm.description}
                  onChange={(e) => setPetForm({ ...petForm, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={creatingPet}
                className="w-full py-3.5 rounded-full bg-brand-dark text-white font-extrabold text-sm uppercase tracking-wider hover:bg-brand-deep transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              >
                {creatingPet ? (
                  <span>Publishing Pet Listing...</span>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 text-sun-primary" />
                    <span>Publish Pet Companion</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
