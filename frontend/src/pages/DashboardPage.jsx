import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  getMyApplications, 
  getPartnerApplications, 
  updateApplicationStatus,
  getMyAppointments,
  getPartnerAppointments,
  updateAppointmentStatus,
  createPet,
  fetchPets
} from '../services/api';
import { 
  Home, 
  User, 
  FileText, 
  Calendar, 
  PlusCircle, 
  Heart, 
  LogOut, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  RotateCcw, 
  Stethoscope, 
  Building2, 
  ArrowUpRight,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  PawPrint
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const isPartner = role === 'partner' || role === 'admin';

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data states
  const [applications, setApplications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [partnerPets, setPartnerPets] = useState([]);
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

  // If user logs out or session is empty, redirect to login
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Load dashboard data
  const loadData = async () => {
    setLoading(true);
    setStatusMsg('');
    try {
      if (isPartner) {
        const [apps, appts, petsData] = await Promise.all([
          getPartnerApplications().catch(() => []),
          getPartnerAppointments().catch(() => []),
          fetchPets({ limit: 50 }).catch(() => ({ pets: [] })),
        ]);
        setApplications(Array.isArray(apps) ? apps : []);
        setAppointments(Array.isArray(appts) ? appts : []);
        setPartnerPets(petsData.pets || []);
      } else {
        const [apps, appts] = await Promise.all([
          getMyApplications().catch(() => []),
          getMyAppointments().catch(() => []),
        ]);
        setApplications(Array.isArray(apps) ? apps : []);
        setAppointments(Array.isArray(appts) ? appts : []);
      }
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, isPartner]);

  // Partner application status updater
  const handleUpdateAppStatus = async (id, status) => {
    try {
      await updateApplicationStatus(id, status);
      setStatusMsg(`Application ${status} successfully!`);
      loadData();
    } catch (err) {
      setStatusMsg(`Failed to update application: ${err.message}`);
    }
  };

  // Partner appointment status updater
  const handleUpdateApptStatus = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      setStatusMsg(`Appointment marked as ${status}!`);
      loadData();
    } catch (err) {
      setStatusMsg(`Failed to update appointment: ${err.message}`);
    }
  };

  // Partner pet listing submitter
  const handleCreatePetSubmit = async (e) => {
    e.preventDefault();
    setCreatingPet(true);
    setStatusMsg('');
    try {
      await createPet(petForm);
      setStatusMsg('New pet companion published successfully to Denly!');
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
      loadData();
      setActiveTab('manage-pets');
    } catch (err) {
      setStatusMsg(`Error creating pet: ${err.message}`);
    } finally {
      setCreatingPet(false);
    }
  };

  if (!user) return null;

  // Overview metrics
  const pendingApps = applications.filter(a => a.status === 'pending').length;
  const approvedApps = applications.filter(a => a.status === 'approved').length;
  const upcomingAppts = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-brand-surface flex">
      
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-brand-dark text-white flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        <div>
          {/* Logo Brand Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-white/10">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-sun-primary text-brand-dark flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
                <PawPrint className="w-4 h-4 fill-brand-dark" />
              </div>
              <div>
                <span className="text-lg font-black font-display tracking-tight text-white block">DENLY</span>
                <span className="text-[10px] font-bold text-sun-primary uppercase tracking-widest block -mt-1">
                  {isPartner ? 'Partner' : 'Adopter'}
                </span>
              </div>
            </Link>

            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5 text-left">
            
            <button
              onClick={() => { setActiveTab('overview'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'overview'
                  ? 'bg-sun-primary text-brand-dark shadow-md'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Overview</span>
            </button>

            {isPartner ? (
              <>
                <button
                  onClick={() => { setActiveTab('applications'); setMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === 'applications'
                      ? 'bg-sun-primary text-brand-dark shadow-md'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4" />
                    <span>Applications</span>
                  </div>
                  {pendingApps > 0 && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {pendingApps}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { setActiveTab('appointments'); setMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === 'appointments'
                      ? 'bg-sun-primary text-brand-dark shadow-md'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-4 h-4" />
                    <span>Clinic Visits</span>
                  </div>
                  {upcomingAppts > 0 && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {upcomingAppts}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { setActiveTab('manage-pets'); setMobileSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === 'manage-pets'
                      ? 'bg-sun-primary text-brand-dark shadow-md'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Listed Pets ({partnerPets.length})</span>
                </button>

                <button
                  onClick={() => { setActiveTab('new-pet'); setMobileSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === 'new-pet'
                      ? 'bg-sun-primary text-brand-dark shadow-md'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>List New Pet</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setActiveTab('applications'); setMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === 'applications'
                      ? 'bg-sun-primary text-brand-dark shadow-md'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4" />
                    <span>My Applications</span>
                  </div>
                  {applications.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-sun-primary text-brand-dark text-[10px] font-bold flex items-center justify-center">
                      {applications.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { setActiveTab('appointments'); setMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === 'appointments'
                      ? 'bg-sun-primary text-brand-dark shadow-md'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-4 h-4" />
                    <span>Vet Visits</span>
                  </div>
                  {appointments.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {appointments.length}
                    </span>
                  )}
                </button>

                <Link
                  to="/#catalog"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-white/75 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Browse More Pets</span>
                </Link>
              </>
            )}

          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>View Public Site</span>
          </Link>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/20 text-left">
            <div className="truncate pr-2">
              <p className="text-xs font-bold text-white truncate">{user.full_name || user.email}</p>
              <p className="text-[10px] font-medium text-white/60 capitalize">{role}</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/'); }}
              title="Sign Out"
              className="p-1.5 rounded-lg text-white/60 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-brand-border px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-brand-surface text-brand-dark"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-brand-dark font-display capitalize">
                {activeTab.replace('-', ' ')}
              </h1>
              <p className="text-xs text-brand-muted font-medium hidden sm:block">
                Welcome back, {user.full_name || user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              title="Refresh Data"
              className="p-2.5 rounded-xl bg-brand-surface hover:bg-zinc-200 text-brand-dark transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sun-primary text-brand-dark font-extrabold text-xs uppercase tracking-wider hover:bg-sun-hover transition-colors shadow-sm"
            >
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-brand-border">
              <div className="w-9 h-9 rounded-full bg-brand-dark text-sun-primary flex items-center justify-center font-bold text-xs">
                {(user.full_name || user.email || 'U')[0].toUpperCase()}
              </div>
            </div>
          </div>

        </header>

        {/* Notifications / Alerts */}
        {statusMsg && (
          <div className="mx-4 sm:mx-8 mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-brand-dark text-xs font-bold flex items-center justify-between">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg('')} className="text-brand-muted hover:text-brand-dark">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main View Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full text-left">
          
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-brand-dark border-t-sun-primary rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm font-bold text-brand-muted">Loading dashboard records...</p>
            </div>
          ) : activeTab === 'overview' ? (
            /* OVERVIEW TAB */
            <div className="space-y-8">
              
              {/* Stat Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                
                <div className="p-6 rounded-3xl bg-white border border-brand-border shadow-sm">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                    {isPartner ? 'Incoming Requests' : 'My Applications'}
                  </p>
                  <p className="text-3xl font-black text-brand-dark font-display mt-1">
                    {applications.length}
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-brand-border shadow-sm">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                    {isPartner ? 'Approved Adoptions' : 'Approved'}
                  </p>
                  <p className="text-3xl font-black text-brand-dark font-display mt-1">
                    {approvedApps}
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-brand-border shadow-sm">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-3">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                    {isPartner ? 'Clinic Appointments' : 'Booked Visits'}
                  </p>
                  <p className="text-3xl font-black text-brand-dark font-display mt-1">
                    {appointments.length}
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-brand-border shadow-sm">
                  <div className="w-10 h-10 rounded-2xl bg-sun-100 text-brand-dark flex items-center justify-center mb-3">
                    {isPartner ? <Building2 className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-amber-600" />}
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                    {isPartner ? 'Listed Pets' : 'Account Status'}
                  </p>
                  <p className="text-3xl font-black text-brand-dark font-display mt-1">
                    {isPartner ? partnerPets.length : 'Active'}
                  </p>
                </div>

              </div>

              {/* Quick Actions & Recent Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Recent Applications Feed */}
                <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-4xl border border-brand-border shadow-card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-brand-dark font-display">
                      Recent Applications
                    </h3>
                    <button
                      onClick={() => setActiveTab('applications')}
                      className="text-xs font-bold text-amber-700 hover:underline"
                    >
                      View all →
                    </button>
                  </div>

                  {applications.length > 0 ? (
                    <div className="space-y-3">
                      {applications.slice(0, 4).map((app) => (
                        <div key={app.id} className="p-4 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm text-brand-dark">
                                {isPartner ? `Applicant: ${app.user_id?.full_name || 'Interested Adopter'}` : `Pet Request #${app.pet_id?.slice(0, 8)}`}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
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
                              Contact: {app.phone} · Date: {new Date(app.created_at).toLocaleDateString()}
                            </p>
                          </div>

                          <button
                            onClick={() => setActiveTab('applications')}
                            className="p-2 rounded-xl bg-white hover:bg-zinc-100 text-brand-dark transition-colors shadow-sm"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-brand-muted text-xs">
                      No applications recorded yet.
                    </div>
                  )}
                </div>

                {/* Quick Shortcuts Banner */}
                <div className="lg:col-span-4 bg-sun-primary p-6 sm:p-8 rounded-4xl shadow-card flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-brand-dark/70 block mb-1">
                      Quick Action
                    </span>
                    <h3 className="text-2xl font-black text-brand-dark font-display leading-tight mb-2">
                      {isPartner ? 'Add a rescue pet to the catalog' : 'Find your next faithful friend'}
                    </h3>
                    <p className="text-xs text-brand-dark/80 font-medium leading-relaxed mb-6">
                      {isPartner 
                        ? 'Publish detailed bios, medical verification, and photos for incoming rescues.' 
                        : 'Explore screened dogs, cats, and small animals waiting for a warm den.'}
                    </p>
                  </div>

                  {isPartner ? (
                    <button
                      onClick={() => setActiveTab('new-pet')}
                      className="w-full py-3 rounded-full bg-brand-dark text-white font-extrabold text-xs uppercase tracking-wider hover:bg-brand-deep transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4 text-sun-primary" />
                      <span>List a Pet Now</span>
                    </button>
                  ) : (
                    <Link
                      to="/#catalog"
                      className="w-full py-3 rounded-full bg-brand-dark text-white font-extrabold text-xs uppercase tracking-wider hover:bg-brand-deep transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Heart className="w-4 h-4 text-sun-primary fill-sun-primary" />
                      <span>Browse Animal Catalog</span>
                    </Link>
                  )}
                </div>

              </div>

            </div>
          ) : activeTab === 'applications' ? (
            /* APPLICATIONS TAB */
            <div className="bg-white p-6 sm:p-8 rounded-4xl border border-brand-border shadow-card">
              <h3 className="text-2xl font-black text-brand-dark font-display mb-6">
                {isPartner ? 'Incoming Adoption Inquiries' : 'Your Submitted Applications'}
              </h3>

              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div 
                      key={app.id} 
                      className="p-5 sm:p-6 rounded-3xl bg-brand-surface border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-lg text-brand-dark">
                            {isPartner ? `Applicant: ${app.user_id?.full_name || 'Prospective Adopter'}` : `Pet Request #${app.pet_id?.slice(0, 8)}`}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                            app.status === 'approved' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : app.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-brand-muted font-medium">
                          Submitted: {new Date(app.created_at).toLocaleDateString()} · Phone: <strong className="text-brand-dark">{app.phone}</strong>
                        </p>
                        {app.message && (
                          <div className="mt-3 p-3.5 rounded-2xl bg-white border border-brand-border text-xs text-brand-subtle leading-relaxed">
                            <strong>Applicant Message:</strong> "{app.message}"
                          </div>
                        )}
                      </div>

                      {isPartner && app.status === 'pending' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleUpdateAppStatus(app.id, 'approved')}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleUpdateAppStatus(app.id, 'rejected')}
                            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-brand-muted">
                  <FileText className="w-12 h-12 text-brand-border mx-auto mb-3" />
                  <h4 className="font-bold text-brand-dark text-base mb-1">No applications on file</h4>
                  <p className="text-xs">Applications submitted or received will appear in this log.</p>
                </div>
              )}
            </div>
          ) : activeTab === 'appointments' ? (
            /* APPOINTMENTS TAB */
            <div className="bg-white p-6 sm:p-8 rounded-4xl border border-brand-border shadow-card">
              <h3 className="text-2xl font-black text-brand-dark font-display mb-6">
                {isPartner ? 'Clinic Appointments Management' : 'Your Scheduled Vet Visits'}
              </h3>

              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appt) => (
                    <div 
                      key={appt.id} 
                      className="p-5 sm:p-6 rounded-3xl bg-brand-surface border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-lg text-brand-dark capitalize">
                            {appt.type} Visit
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                            appt.status === 'confirmed' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : appt.status === 'done'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {appt.status}
                          </span>
                        </div>
                        <p className="text-xs text-brand-muted font-medium">
                          Preferred Date: <strong className="text-brand-dark">{appt.preferred_date}</strong> · Patient: {appt.full_name} ({appt.phone})
                        </p>
                        {appt.notes && (
                          <div className="mt-2 text-xs text-brand-subtle italic">
                            Notes: "{appt.notes}"
                          </div>
                        )}
                      </div>

                      {isPartner && (
                        <div className="flex items-center gap-2 shrink-0">
                          {appt.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateApptStatus(appt.id, 'confirmed')}
                              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                              Confirm Slot
                            </button>
                          )}
                          {appt.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateApptStatus(appt.id, 'done')}
                              className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                              Mark Done
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-brand-muted">
                  <Stethoscope className="w-12 h-12 text-brand-border mx-auto mb-3" />
                  <h4 className="font-bold text-brand-dark text-base mb-1">No clinic visits found</h4>
                  <p className="text-xs">Low-cost vaccinations and medical appointments will appear here.</p>
                </div>
              )}
            </div>
          ) : activeTab === 'manage-pets' ? (
            /* PARTNER LISTED PETS */
            <div className="bg-white p-6 sm:p-8 rounded-4xl border border-brand-border shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-brand-dark font-display">
                  Listed Companion Animals ({partnerPets.length})
                </h3>
                <button
                  onClick={() => setActiveTab('new-pet')}
                  className="px-5 py-2 rounded-full bg-sun-primary text-brand-dark font-extrabold text-xs uppercase tracking-wider hover:bg-sun-hover transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>List New Pet</span>
                </button>
              </div>

              {partnerPets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {partnerPets.map((pet) => (
                    <div key={pet.id} className="p-4 rounded-3xl bg-brand-surface border border-brand-border flex flex-col justify-between">
                      <div>
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-zinc-200">
                          <img
                            src={pet.image_url || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-black text-base text-brand-dark font-display">{pet.name}</h4>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sun-100 text-brand-dark">
                            {pet.status || 'Available'}
                          </span>
                        </div>
                        <p className="text-xs text-brand-muted capitalize">{pet.species} · {pet.breed || 'Rescue'}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-xs font-bold text-brand-subtle">
                        <span>{pet.is_vaccinated ? '✓ Vaccinated' : 'Unvaccinated'}</span>
                        <span className="text-emerald-700">{pet.fee || 'Free to Adopt'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-brand-muted">
                  <p>No pets listed yet. Click "List New Pet" above to add your shelter's rescues!</p>
                </div>
              )}
            </div>
          ) : (
            /* NEW PET FORM */
            <div className="bg-white p-6 sm:p-8 rounded-4xl border border-brand-border shadow-card max-w-3xl mx-auto">
              <h3 className="text-2xl font-black text-brand-dark font-display mb-2">
                Publish a New Pet to Denly
              </h3>
              <p className="text-xs text-brand-muted font-medium mb-6">
                Your listing will immediately appear in the public animal catalog for prospective adopters.
              </p>

              <form onSubmit={handleCreatePetSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                      Pet Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Copper"
                      value={petForm.name}
                      onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                      Species *
                    </label>
                    <select
                      value={petForm.species}
                      onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
                    >
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="hamster">Hamster</option>
                      <option value="other">Small Pet / Bunny</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                      Breed
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Golden Mix"
                      value={petForm.breed}
                      onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                      Gender
                    </label>
                    <select
                      value={petForm.gender}
                      onChange={(e) => setPetForm({ ...petForm, gender: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-2.5 p-3.5 rounded-xl bg-brand-surface border border-brand-border cursor-pointer">
                    <input
                      type="checkbox"
                      checked={petForm.is_vaccinated}
                      onChange={(e) => setPetForm({ ...petForm, is_vaccinated: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-dark"
                    />
                    <span className="text-xs font-bold text-brand-dark">Vaccinated & Microchipped</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3.5 rounded-xl bg-brand-surface border border-brand-border cursor-pointer">
                    <input
                      type="checkbox"
                      checked={petForm.is_sterilized}
                      onChange={(e) => setPetForm({ ...petForm, is_sterilized: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-dark"
                    />
                    <span className="text-xs font-bold text-brand-dark">Sterilized (Spayed/Neutered)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Photo URL (Unsplash or direct image link)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={petForm.image_url}
                    onChange={(e) => setPetForm({ ...petForm, image_url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Personality & Health Bio *
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Tell adopters about their story, temperament, energy level, and favorite games..."
                    value={petForm.description}
                    onChange={(e) => setPetForm({ ...petForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={creatingPet}
                  className="w-full py-4 rounded-full bg-brand-dark text-white font-extrabold text-sm uppercase tracking-wider hover:bg-brand-deep transition-all shadow-md flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {creatingPet ? (
                    <span>Publishing Pet...</span>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 text-sun-primary" />
                      <span>Publish Pet Listing</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </main>

      </div>

    </div>
  );
};
