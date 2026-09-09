import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Sparkles, 
  Play, 
  Clock, 
  User, 
  CheckCircle2, 
  ExternalLink,
  ChevronLeft,
  Video
} from 'lucide-react';

const FALLBACK_VIDEOS = {
  adoption: {
    id: 'I-yEiKkric8',
    duration: '11:24',
    author: 'Smart Dog Training',
    title: 'Dog Training Basic Tutorial (Hindi Audio Guide)'
  },
  vaccination: {
    id: 'QInn83fYWng',
    duration: '7:48',
    author: 'Veterinary Care Collective, India',
    title: 'Dog Vaccination Schedule & Cost Guide (Hindi Audio)'
  },
  care: {
    id: 'd_yua6iKGkI',
    duration: '9:35',
    author: 'At Mix Pet Care',
    title: 'Puppy Care Step-by-Step Guide (Hindi Audio)'
  },
  sterilization: {
    id: 'i-zM9DohUV8',
    duration: '13:40',
    author: 'Smart Dog Training & Shelter Welfare',
    title: 'Home Dog Training & Behavior Guide (Hindi Audio)'
  },
  default: {
    id: 'APbVoNqM68E',
    duration: '8:50',
    author: 'Wild Earth & Whiskers Network',
    title: 'Complete Cat Care & Nutrition Guide (Hindi Audio)'
  }
};

export const CareResourcesModal = ({ isOpen, onClose, resources = [] }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Guides & Videos' },
    { id: 'videos', label: '🎥 Video Masterclasses' },
    { id: 'adoption', label: 'Adoption & 3-3-3 Rule' },
    { id: 'vaccination', label: 'Vaccines' },
    { id: 'sterilization', label: 'Spay / Neuter' },
    { id: 'care', label: 'Daily Care & Nutrition' },
  ];

  const filtered = activeCategory === 'all'
    ? resources
    : activeCategory === 'videos'
    ? resources
    : resources.filter(r => r.category === activeCategory);

  const getVideoDetails = (item) => {
    if (item.youtube_id) {
      return {
        id: item.youtube_id,
        duration: item.video_duration || '8:00',
        author: item.author || 'Certified Veterinarian',
        title: item.video_title || item.title
      };
    }
    const cat = item.category || 'default';
    return FALLBACK_VIDEOS[cat] || FALLBACK_VIDEOS.default;
  };

  const currentVideo = selectedArticle ? getVideoDetails(selectedArticle) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-4xl shadow-2xl p-6 sm:p-8 my-8 text-left max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sun-primary text-brand-dark flex items-center justify-center font-bold shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-brand-dark font-display">
                  Care & Adoption Knowledge Hub
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider">
                  <Video className="w-3 h-3" />
                  YouTube Videos Included
                </span>
              </div>
              <p className="text-xs font-semibold text-brand-muted mt-0.5">
                Verified veterinary video lessons and pet parenting guides for Indian homes
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

        {/* Selected Article Detail View with YouTube Embed */}
        {selectedArticle ? (
          <div className="py-6 overflow-y-auto space-y-6 flex-1 pr-1">
            
            <button
              onClick={() => setSelectedArticle(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to all knowledge guides</span>
            </button>

            {/* Embedded YouTube Video Player */}
            <div className="rounded-3xl overflow-hidden shadow-card border border-brand-border bg-black aspect-video relative">
              <iframe
                src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&rel=0`}
                title={selectedArticle.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            {/* Video metadata bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-brand-surface border border-brand-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center">
                  <Play className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-brand-dark">
                    {currentVideo.title}
                  </p>
                  <p className="text-[11px] text-brand-muted flex items-center gap-2">
                    <span>Instructed by {currentVideo.author}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {currentVideo.duration}
                    </span>
                  </p>
                </div>
              </div>

              <a
                href={`https://www.youtube.com/watch?v=${currentVideo.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-brand-border text-[11px] font-bold text-brand-dark hover:bg-zinc-100 transition-colors shadow-sm"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Article Content */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-sun-primary/30 text-brand-dark font-black text-[11px] uppercase tracking-wider">
                  {selectedArticle.category}
                </span>
                <span className="text-xs text-brand-muted">Verified Care Protocol</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-brand-dark font-display leading-tight">
                {selectedArticle.title}
              </h2>
              
              <div className="text-sm text-brand-subtle leading-relaxed whitespace-pre-line pt-1 font-medium bg-white p-6 rounded-3xl border border-brand-border shadow-sm">
                {selectedArticle.body}
              </div>
            </div>

          </div>
        ) : (
          <>
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 py-4 border-b border-brand-border">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-4 py-2 rounded-full text-xs font-black transition-colors ${
                    activeCategory === c.id
                      ? 'bg-brand-dark text-sun-primary shadow-sm'
                      : 'bg-brand-surface text-brand-muted hover:bg-zinc-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Guides & Videos Grid */}
            <div className="py-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 pr-1">
              {filtered.map((item) => {
                const videoInfo = getVideoDetails(item);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedArticle(item)}
                    className="bg-brand-surface rounded-3xl p-5 border border-brand-border hover:shadow-card-hover transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Video Thumbnail with Play Badge */}
                      <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-zinc-900">
                        <img
                          src={item.cover_url || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80"}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-80"
                        />
                        
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-white ml-0.5" />
                          </div>
                        </div>

                        {/* Duration pill badge */}
                        <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-md bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{videoInfo.duration}</span>
                        </div>

                        {/* Category tag */}
                        <div className="absolute top-2.5 left-2.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-brand-dark bg-sun-primary/95 px-2.5 py-0.5 rounded-md shadow-sm">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-lg font-black text-brand-dark font-display group-hover:text-amber-800 transition-colors line-clamp-2 mb-2">
                        {item.title}
                      </h4>
                      
                      <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed mb-1">
                        {item.body}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-brand-border flex items-center justify-between text-xs font-bold">
                      <span className="text-brand-muted text-[11px] truncate max-w-[200px]">
                        {videoInfo.author}
                      </span>
                      <span className="text-brand-dark group-hover:text-red-600 transition-colors inline-flex items-center gap-1">
                        <span>Watch Video</span>
                        <Play className="w-3 h-3 fill-current" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </div>
  );
};
