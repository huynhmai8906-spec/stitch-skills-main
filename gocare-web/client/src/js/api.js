/**
 * GoCare API Client
 */
const API_BASE = '/api';

export const api = {
  // Health
  checkHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Caregivers
  getCaregivers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/caregivers${query ? `?${query}` : ''}`);
    return res.json();
  },

  getCaregiverById: async (id) => {
    const res = await fetch(`${API_BASE}/caregivers/${id}`);
    return res.json();
  },

  // Medical Dispatch & Dijkstra Routing
  getDispatchNodes: async () => {
    const res = await fetch(`${API_BASE}/dispatch/nodes`);
    return res.json();
  },

  getDispatchRoute: async (start = 'thao-dien', target = 'villas-thao-dien') => {
    const res = await fetch(`${API_BASE}/dispatch/route?start=${start}&target=${target}`);
    return res.json();
  },

  // Bookings
  getBookings: async () => {
    const res = await fetch(`${API_BASE}/bookings`);
    return res.json();
  },

  createBooking: async (data) => {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Reviews
  getReviews: async () => {
    const res = await fetch(`${API_BASE}/reviews`);
    return res.json();
  },

  createReview: async (data) => {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Patient EHR
  getPatientEhr: async (patientId = 'GC-P-8842') => {
    const res = await fetch(`${API_BASE}/ehr/${patientId}`);
    return res.json();
  },

  addPatientVitals: async (patientId, data) => {
    const res = await fetch(`${API_BASE}/ehr/${patientId}/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Pharmacy
  getPharmacyProducts: async () => {
    const res = await fetch(`${API_BASE}/pharmacy`);
    return res.json();
  },

  // AI Care Assistant Chat
  sendAiMessage: async (message, patientId = 'GC-P-8842') => {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, patientId })
    });
    return res.json();
  }
};
