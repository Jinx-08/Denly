import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AppointmentModal } from '../components/AppointmentModal';
import { fetchResources, fetchPartners } from '../services/api';
import { MOCK_RESOURCES } from '../services/mockData';
import { 
  BookOpen, 
  Play, 
  Clock, 
  User, 
  ShieldCheck, 
  Video, 
  Search, 
  ExternalLink, 
  Sparkles, 
  Stethoscope, 
  Heart,
  ChevronRight,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export const CareGuidesPage = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState(MOCK_RESOURCES);
  const [partners, setPartners] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(MOCK_RESOURCES[0]);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Fetch resources from API with fallback
    fetchResources()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge API data with rich mock data for video attributes
          const merged = data.map((item, idx) => {
            const fallback = MOCK_RESOURCES[idx % MOCK_RESOURCES.length];
            return {
              ...fallback,
              ...item,
              youtube_id: item.youtube_id || fallback.youtube_id,
              video_duration: item.video_duration || fallback.video_duration,
              video_title: item.video_title || fallback.video_title || item.title,
              author: item.author || fallback.author
            };
          });
          setResources(merged);
          setSelectedVideo(merged[0]);
        }
      })
      .catch((err) => console.warn('Using default care resources:', err));

    fetchPartners()
      .then((data) => setPartners(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const categories = [
    { id: 'all', label: 'All Guides & Videos' },
    { id: 'videos', label: '🎥 Hindi Video Guides' },
    { id: 'adoption', label: 'Dog Training' },
    { id: 'vaccination', label: 'Vaccines & Costs' },
    { id: 'care', label: 'Puppy & Cat Care' },
    { id: 'sterilization', label: 'Home Behavior' },
  ];

  // Filter guides
  const filteredResources = resources.filter((item) => {
    const matchesCategory = 
      activeCategory === 'all' || 
      activeCategory === 'videos' || 
      item.category === activeCategory;

    const matchesSearch = 
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleSelectVideo = (item) => {
    setSelectedVideo(item);
    const playerEl = document.getElementById('featured-video-player');
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-dark">
      
      {/* 1. Navbar */}
      <Navbar
        onOpenAuth={() => navigate('/login')}
        onOpenDashboard={() => navigate('/dashboard')}
        onOpenAppointment={() => setAppointmentModalOpen(true)}
        onOpenCareResources={() => {}}
      />

      <main className="flex-1 pb-20">
        
        {/* 2. Hero Section */}
        <section className="bg-sun-primary/20 border-b border-sun-hover/30 pt-10 pb-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-left">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-bold text-brand-muted uppercase tracking-wider mb-4">
              <Link to="/" className="hover:text-brand-dark transition-colors">Home</Link>
              <span>/</span>
              <span className="text-brand-dark">Care & Video Guides</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sun-primary text-brand-dark text-xs font-black uppercase tracking-wider shadow-sm mb-3">
                  <Video className="w-3.5 h-3.5 text-red-600" />
                  <span>Hindi Video Masterclasses · Expert Care</span>
                </div>
                
                <h1 className="text-3xl sm:text-5xl font-black text-brand-dark font-display tracking-tight leading-tight">
                  Pet Parenting & Veterinary Guides
                </h1>
                
                <p className="mt-3 text-sm sm:text-base text-brand-subtle max-w-2xl font-medium leading-relaxed">
                  Verified video masterclasses with Hindi audio commentary and comprehensive English care guides. Learn puppy training, vaccination timelines, nutrition, and apartment pet care.
                </p>
              </div>

              {/* Quick Search */}
              <div className="w-full md:w-80">
                <div className="relative">
                  <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search guides or videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-brand-border text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-dark/20 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-8">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-4 py-2.5 rounded-full text-xs font-black transition-all ${
                    activeCategory === c.id
                      ? 'bg-brand-dark text-sun-primary shadow-md scale-105'
                      : 'bg-white text-brand-subtle hover:bg-white/80 border border-brand-border/60'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

          </div>
        </section>

        {/* 3. Featured Cinema Player Section */}
        {selectedVideo && (
          <section id="featured-video-player" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
            <div className="bg-white rounded-4xl border border-brand-border p-6 sm:p-8 shadow-card text-left">
              
              <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-brand-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-muted block">
                      Currently Playing Video Masterclass
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-brand-dark font-display line-clamp-1">
                      {selectedVideo.video_title || selectedVideo.title}
                    </h2>
                  </div>
                </div>

                <a
                  href={`https://www.youtube.com/watch?v=${selectedVideo.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-surface border border-brand-border text-xs font-bold text-brand-dark hover:bg-zinc-200 transition-colors shadow-sm"
                >
                  <span>Open in YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* YouTube Video Player Embed */}
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-brand-border bg-black aspect-video relative">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?autoplay=1&rel=0`}
                  title={selectedVideo.video_title || selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              {/* Video Info and Description */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-sun-primary/30 text-brand-dark font-black text-xs uppercase tracking-wider">
                      {selectedVideo.category}
                    </span>
                    <span className="text-xs font-semibold text-brand-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Duration: {selectedVideo.video_duration || '12:00'}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Veterinary Verified
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-brand-dark font-display">
                    {selectedVideo.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-brand-subtle leading-relaxed font-medium whitespace-pre-line bg-brand-surface p-5 rounded-2xl border border-brand-border">
                    {selectedVideo.body}
                  </p>
                </div>

                {/* Right Quick Info Card */}
                <div className="bg-brand-surface rounded-2xl p-5 border border-brand-border flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-brand-muted mb-2">
                      Instructor & Authority
                    </h4>
                    <p className="text-sm font-bold text-brand-dark">
                      {selectedVideo.author || 'Certified Canine Specialist'}
                    </p>
                    <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                      All video guides are curated with registered Indian shelters, veterinary surgeons, and behavioral trainers.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-brand-border space-y-2">
                    <p className="text-xs font-black text-brand-dark">
                      Need in-person clinical care?
                    </p>
                    <button
                      onClick={() => setAppointmentModalOpen(true)}
                      className="w-full py-2.5 rounded-xl bg-brand-dark text-sun-primary font-black text-xs uppercase tracking-wider hover:bg-brand-deep transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>Book Clinic Visit</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </section>
        )}

        {/* 4. All Videos & Articles Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <div className="text-left mb-6">
            <h3 className="text-2xl font-black text-brand-dark font-display">
              All Care Lessons & Video Guides
            </h3>
            <p className="text-xs sm:text-sm text-brand-muted">
              Click any video card below to stream it in the cinema player above.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {filteredResources.map((item) => {
              const isCurrent = selectedVideo && selectedVideo.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectVideo(item)}
                  className={`bg-white rounded-3xl p-5 border transition-all cursor-pointer group flex flex-col justify-between ${
                    isCurrent 
                      ? 'border-brand-dark ring-2 ring-brand-dark/20 shadow-lg' 
                      : 'border-brand-border hover:shadow-card-hover'
                  }`}
                >
                  <div>
                    {/* Video Thumbnail with Play Button */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-zinc-900">
                      <img
                        src={item.cover_url || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80"}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-80"
                      />
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${
                          isCurrent ? 'bg-amber-400 text-brand-dark' : 'bg-red-600 text-white'
                        }`}>
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Duration Badge */}
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-md bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.video_duration || '10:00'}</span>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-brand-dark bg-sun-primary/95 px-2.5 py-0.5 rounded-md shadow-sm">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-brand-dark font-display group-hover:text-amber-800 transition-colors line-clamp-2 mb-2">
                      {item.title}
                    </h4>

                    <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed mb-4">
                      {item.body}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-brand-border flex items-center justify-between text-xs font-bold">
                    <span className="text-brand-muted text-[11px] truncate max-w-[170px]">
                      {item.author}
                    </span>
                    <span className={`inline-flex items-center gap-1 transition-colors ${
                      isCurrent ? 'text-amber-700' : 'text-brand-dark group-hover:text-red-600'
                    }`}>
                      <span>{isCurrent ? 'Playing Now' : 'Watch Video'}</span>
                      <Play className="w-3 h-3 fill-current" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Essential Pet Care Protocols in India */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-brand-surface rounded-4xl p-6 sm:p-10 border border-brand-border text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-brand-dark text-sun-primary flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-brand-dark font-display">
                  Essential Indian Pet Care Protocols
                </h3>
                <p className="text-xs text-brand-muted">
                  Quick rules every adopter and pet guardian in India should know
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-3xl border border-brand-border space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4" />
                  <span>Mandatory Anti-Rabies</span>
                </div>
                <h4 className="text-sm font-bold text-brand-dark">Annual ARV Shots</h4>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Indian law mandates annual Anti-Rabies vaccinations for all domestic and rescued dogs and cats. First dose is given at 90 days of age.
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-brand-border space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-amber-700 font-black text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>The 3-3-3 Rule</span>
                </div>
                <h4 className="text-sm font-bold text-brand-dark">Street Dog Decompression</h4>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Expect 3 days of nervousness, 3 weeks to discover your daily walk routine, and 3 months to build deep trust with an indie rescue.
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-brand-border space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-700 font-black text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Monsoon Tick Fever</span>
                </div>
                <h4 className="text-sm font-bold text-brand-dark">Vector & Tick Prevention</h4>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Ticks cause fatal Babesiosis and Ehrlichia in humid months. Use vet-approved spot-on drops (Fipronil) and inspect paw pads after every stroll.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 6. Footer */}
      <Footer
        onOpenAppointment={() => setAppointmentModalOpen(true)}
        onOpenCareResources={() => {}}
      />

      {/* Public Appointment Modal */}
      <AppointmentModal
        isOpen={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        partners={partners}
      />

    </div>
  );
};
