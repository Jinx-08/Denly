import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { BenefitsSection } from '../components/BenefitsSection';
import { StatsBanner } from '../components/StatsBanner';
import { PetCatalogSection } from '../components/PetCatalogSection';
import { PartnersSection } from '../components/PartnersSection';
import { GallerySection } from '../components/GallerySection';
import { Footer } from '../components/Footer';

// Modals for public interactions
import { PetDetailsModal } from '../components/PetDetailsModal';
import { AppointmentModal } from '../components/AppointmentModal';
import { CareResourcesModal } from '../components/CareResourcesModal';

import { 
  fetchPets, 
  fetchStats, 
  fetchPartners, 
  fetchResources,
  getMyApplications 
} from '../services/api';

export const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [pets, setPets] = useState([]);
  const [stats, setStats] = useState({});
  const [partners, setPartners] = useState([]);
  const [resources, setResources] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);

  // Filter states
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vaccinatedFilter, setVaccinatedFilter] = useState(false);
  const [sterilizedFilter, setSterilizedFilter] = useState(false);

  // Modals
  const [selectedPet, setSelectedPet] = useState(null);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [careModalOpen, setCareModalOpen] = useState(false);
  const [applicationCount, setApplicationCount] = useState(0);

  // Load pets with active filters
  const loadPets = async () => {
    setLoadingPets(true);
    try {
      const params = {};
      if (activeCategory !== 'all') params.species = activeCategory;
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (vaccinatedFilter) params.vaccinated = 'true';
      if (sterilizedFilter) params.sterilized = 'true';

      const data = await fetchPets(params);
      setPets(data.pets || []);
    } catch (err) {
      console.error('Error fetching pets:', err);
    } finally {
      setLoadingPets(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [statsData, partnersData, resourcesData] = await Promise.all([
          fetchStats(),
          fetchPartners(),
          fetchResources(),
        ]);
        setStats(statsData);
        setPartners(partnersData);
        setResources(resourcesData);
      } catch (err) {
        console.warn('Initial data load warning:', err);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadPets();
    }, 250);
    return () => clearTimeout(debounce);
  }, [activeCategory, searchQuery, vaccinatedFilter, sterilizedFilter]);

  // Load application count badge if user logged in
  useEffect(() => {
    if (user) {
      getMyApplications()
        .then((apps) => {
          if (Array.isArray(apps)) setApplicationCount(apps.length);
        })
        .catch(() => {});
    } else {
      setApplicationCount(0);
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-dark">
      
      {/* 1. Header / Navbar */}
      <Navbar
        onOpenAuth={() => navigate('/login')}
        onOpenDashboard={() => navigate('/dashboard')}
        onOpenAppointment={() => setAppointmentModalOpen(true)}
        onOpenCareResources={() => setCareModalOpen(true)}
        applicationCount={applicationCount}
      />

      {/* 2. Hero Section */}
      <HeroSection
        onSelectCategory={(species) => {
          setActiveCategory(species);
          const el = document.getElementById('catalog');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenAppointment={() => setAppointmentModalOpen(true)}
      />

      {/* 3. Three-Pillar Value Proposition */}
      <BenefitsSection />

      {/* 4. Live Impact Banner */}
      <StatsBanner stats={stats} />

      {/* 5. Animal Catalog */}
      <PetCatalogSection
        pets={pets}
        loading={loadingPets}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        vaccinatedFilter={vaccinatedFilter}
        sterilizedFilter={sterilizedFilter}
        onToggleVaccinated={() => setVaccinatedFilter(!vaccinatedFilter)}
        onToggleSterilized={() => setSterilizedFilter(!sterilizedFilter)}
        onSelectPet={(pet) => setSelectedPet(pet)}
      />

      {/* 6. Partner Shelters & Vets */}
      <PartnersSection
        partners={partners}
        onOpenAppointment={() => setAppointmentModalOpen(true)}
      />

      {/* 7. Happy Tails Gallery */}
      <GallerySection />

      {/* 8. Footer */}
      <Footer
        onOpenAppointment={() => setAppointmentModalOpen(true)}
        onOpenCareResources={() => setCareModalOpen(true)}
      />

      {/* Public Modals */}
      <PetDetailsModal
        pet={selectedPet}
        onClose={() => setSelectedPet(null)}
        onOpenAuth={() => {
          setSelectedPet(null);
          navigate('/login');
        }}
        onApplicationSubmitted={() => {
          setApplicationCount(prev => prev + 1);
        }}
      />

      <AppointmentModal
        isOpen={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        partners={partners}
      />

      <CareResourcesModal
        isOpen={careModalOpen}
        onClose={() => setCareModalOpen(false)}
        resources={resources}
      />

    </div>
  );
};
