import { MOCK_PETS, MOCK_STATS, MOCK_PARTNERS, MOCK_RESOURCES } from './mockData';

const BASE_URL = '/api';

const getHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('denly_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// --- Pets API ---
export async function fetchPets(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.species && params.species !== 'all') query.append('species', params.species);
    if (params.city) query.append('city', params.city);
    if (params.vaccinated) query.append('vaccinated', params.vaccinated);
    if (params.sterilized) query.append('sterilized', params.sterilized);
    if (params.status) query.append('status', params.status);
    if (params.q) query.append('q', params.q);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit || 12);

    const res = await fetch(`${BASE_URL}/pets?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Backend unavailable, falling back to mock pets:', err.message);
    let filtered = [...MOCK_PETS];
    if (params.species && params.species !== 'all') {
      filtered = filtered.filter(p => p.species.toLowerCase() === params.species.toLowerCase());
    }
    if (params.q) {
      const q = params.q.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.breed && p.breed.toLowerCase().includes(q)) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    if (params.vaccinated === 'true') filtered = filtered.filter(p => p.is_vaccinated);
    if (params.sterilized === 'true') filtered = filtered.filter(p => p.is_sterilized);

    return {
      pets: filtered,
      total: filtered.length,
      page: 1,
      totalPages: 1,
    };
  }
}

export async function fetchPetById(id) {
  try {
    const res = await fetch(`${BASE_URL}/pets/${id}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.pet;
  } catch (err) {
    console.warn('Backend unavailable, searching mock pets for ID:', id);
    return MOCK_PETS.find(p => p.id === id) || MOCK_PETS[0];
  }
}

export async function createPet(petData) {
  const res = await fetch(`${BASE_URL}/pets`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(petData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to create pet' }));
    throw new Error(err.error || err.errors?.[0]?.msg || 'Failed to create pet');
  }
  return res.json();
}

// --- Auth API ---
export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.errors?.[0]?.msg || 'Login failed');
  }
  return data;
}

export async function registerUser(name, email, password, role = 'adopter') {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.errors?.[0]?.msg || 'Registration failed');
  }
  return data;
}

export async function getProfile() {
  const res = await fetch(`${BASE_URL}/auth/profile`, {
    headers: getHeaders(true),
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

// --- Adoption Applications API ---
export async function submitApplication(pet_id, phone, message) {
  const res = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ pet_id, phone, message }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.errors?.[0]?.msg || 'Failed to submit application');
  }
  return data;
}

export async function getMyApplications() {
  try {
    const res = await fetch(`${BASE_URL}/applications/mine`, {
      headers: getHeaders(true),
    });
    if (!res.ok) throw new Error('Failed to fetch user applications');
    return res.json();
  } catch (err) {
    console.warn('Using local fallback for applications');
    return [];
  }
}

export async function getPartnerApplications() {
  const res = await fetch(`${BASE_URL}/applications/partner`, {
    headers: getHeaders(true),
  });
  if (!res.ok) throw new Error('Failed to fetch partner applications');
  return res.json();
}

export async function updateApplicationStatus(id, status) {
  const res = await fetch(`${BASE_URL}/applications/${id}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update application status');
  return res.json();
}

// --- Appointments API ---
export async function bookAppointment({ partner_id, full_name, phone, type, preferred_date, notes }) {
  const res = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ partner_id, full_name, phone, type, preferred_date, notes }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.errors?.[0]?.msg || 'Failed to book appointment');
  }
  return data;
}

export async function getMyAppointments() {
  try {
    const res = await fetch(`${BASE_URL}/appointments/mine`, {
      headers: getHeaders(true),
    });
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  } catch (err) {
    return [];
  }
}

export async function getPartnerAppointments() {
  const res = await fetch(`${BASE_URL}/appointments/partner`, {
    headers: getHeaders(true),
  });
  if (!res.ok) throw new Error('Failed to fetch partner appointments');
  return res.json();
}

export async function updateAppointmentStatus(id, status) {
  const res = await fetch(`${BASE_URL}/appointments/${id}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update appointment status');
  return res.json();
}

// --- Public Stats, Partners, Resources ---
export async function fetchStats() {
  try {
    const res = await fetch(`${BASE_URL}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using mock stats');
    return MOCK_STATS;
  }
}

export async function fetchPartners() {
  try {
    const res = await fetch(`${BASE_URL}/partners`);
    if (!res.ok) throw new Error('Failed to fetch partners');
    const data = await res.json();
    return Array.isArray(data) ? data : data.partners || MOCK_PARTNERS;
  } catch (err) {
    console.warn('Backend unavailable, using mock partners');
    return MOCK_PARTNERS;
  }
}

export async function fetchResources() {
  try {
    const res = await fetch(`${BASE_URL}/resources`);
    if (!res.ok) throw new Error('Failed to fetch resources');
    const data = await res.json();
    return Array.isArray(data) ? data : data.resources || MOCK_RESOURCES;
  } catch (err) {
    console.warn('Backend unavailable, using mock resources');
    return MOCK_RESOURCES;
  }
}
