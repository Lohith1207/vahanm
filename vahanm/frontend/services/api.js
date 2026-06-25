import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url);
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized detected. Clearing auth and redirecting to login.');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      try {
        useAuthStore.getState().logout();
      } catch(e) {
        console.error("Could not update auth store", e);
      }
      
      // Only redirect if not already on login/signup pages to avoid loops
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTHENTICATION API
// ============================================
export const authAPI = {
  // Customer signup
  signupCustomer: (data) => apiClient.post('/auth/signup/customer', data),

  // Driver signup
  signupDriver: (data) => apiClient.post('/auth/signup/driver', data),

  // Login with phone + password
  login: (credentials) => apiClient.post('/auth/login', credentials),

  // Get current user info
  getCurrentUser: () => apiClient.get('/auth/me'),

  // Check driver verification status
  getVerificationStatus: () => apiClient.get('/auth/verification-status'),
};

// ============================================
// OCR LICENSE VERIFICATION API
// ============================================
const OCR_BASE_URL = 'http://localhost:8080/api/v1/ocr';

export const ocrAPI = {
  // Upload license for verification
  uploadLicense: async (driverId, driverName, licenseImage) => {
    const formData = new FormData();
    formData.append('driver_id', driverId);
    formData.append('signup_name', driverName);
    formData.append('file', licenseImage);

    const response = await fetch(`${OCR_BASE_URL}/driver/upload-license`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to upload license');
    }

    return response.json();
  },

  // Check verification status
  getVerificationStatus: async (driverId) => {
    const response = await fetch(`${OCR_BASE_URL}/driver/ocr-status/${driverId}`);

    if (!response.ok) {
      throw new Error('Failed to check verification status');
    }

    return response.json();
  },

  // Sync OCR status to main backend
  syncOCRStatus: async (driverId) => {
    const response = await apiClient.post(`/auth/sync-ocr-status/${driverId}`);
    return response.data;
  },

  // Reset OCR status (Admin only)
  resetOCRStatus: async (driverId) => {
    // This might be an admin endpoint or handled via update
    return apiClient.put(`/admin/drivers/${driverId}/reset-ocr`);
  },
};

// ============================================
// PAYMENT API
// ============================================
export const paymentAPI = {
  // Create a Razorpay Order
  createOrder: (data) => apiClient.post('/payments/create-order', data),

  // Verify a completed Razorpay Payment
  verifyPayment: (data) => apiClient.post('/payments/verify', data),

  // Fetch user's Payment History
  getHistory: () => apiClient.get('/payments/history'),
};

// ============================================
// CUSTOMER API
// ============================================
export const customerAPI = {
  // Get fare estimate
  getRideEstimate: (data) => apiClient.post('/customer/rides/estimate', data),

  // Create ride request
  createRide: (rideData) => apiClient.post('/customer/rides', rideData),

  // Get ride history
  getRides: (limit = 30) => apiClient.get('/customer/rides', { params: { limit } }),

  // Get specific ride details
  getRideById: (id) => apiClient.get(`/customer/rides/${id}`),

  // Cancel ride
  cancelRide: (id, reason) => apiClient.post(`/customer/rides/${id}/cancel`, { reason, cancelled_by: 'customer' }),

  // Rate completed ride
  rateRide: (id, rating, feedback) => apiClient.post(`/customer/rides/${id}/rate`, { rating, feedback }),

  // Get customer profile
  getProfile: () => apiClient.get('/customer/profile'),

  // --- Support Tickets & AI ---
  createSupportTicket: (data) => apiClient.post('/customer/support/tickets', data),
  getSupportTickets: (userId) => apiClient.get(`/customer/support/tickets/user/${userId}`),
  getSupportTicketById: (id) => apiClient.get(`/customer/support/tickets/${id}`),
  sendSupportChatMessage: (data) => apiClient.post('/customer/support/chat', data),

  // --- Safety Incidents ---
  reportSafetyIncident: (data) => apiClient.post('/safety/report', data),
  getSafetyReports: () => apiClient.get('/safety/my-reports'),
};

// ============================================
// DRIVER API
// ============================================
export const driverAPI = {
  // Get nearby available rides
  getAvailableRides: (latitude, longitude, radius = 5) =>
    apiClient.get('/driver/rides/available', { params: { latitude, longitude, radius_km: radius } }),

  // Accept ride
  acceptRide: (id) => apiClient.post(`/driver/rides/${id}/accept`),

  // Start ride with OTP
  startRide: (id, otp) => apiClient.post(`/driver/rides/${id}/start`, null, { params: { otp } }),

  // Complete ride
  completeRide: (id) => apiClient.post(`/driver/rides/${id}/complete`),

  // Cancel ride
  cancelRide: (id, reason) => apiClient.post(`/driver/rides/${id}/cancel`, { reason, cancelled_by: 'driver' }),

  // Get ride history
  getRides: (limit = 30) => apiClient.get('/driver/rides', { params: { limit } }),

  // Get earnings summary
  getEarnings: () => apiClient.get('/driver/earnings'),

  // Add vehicle
  addVehicle: (vehicleData) => apiClient.post('/driver/vehicles', vehicleData),

  // Get vehicles
  getVehicles: () => apiClient.get('/driver/vehicles'),

  // Upload vehicle document
  uploadDocument: (vehicleId, documentData) =>
    apiClient.post(`/driver/vehicles/${vehicleId}/documents`, documentData),

  // Get driver profile
  getProfile: () => apiClient.get('/driver/profile'),

  // Update online/offline status
  updateStatus: (isOnline) => apiClient.put('/driver/status', { is_online: isOnline }),
};

// ============================================
// ADMIN API
// ============================================
export const adminAPI = {
  // Get dashboard stats
  getDashboardStats: () => apiClient.get('/admin/dashboard/stats'),

  // Get live monitor data
  getLiveMonitorData: () => apiClient.get('/admin/monitor/live'),

  // Get all users
  getUsers: (params) => apiClient.get('/admin/users', { params }),

  // Update user status
  updateUserStatus: (userId, isActive) =>
    apiClient.put(`/admin/users/${userId}/status`, null, { params: { is_active: isActive } }),

  // Create user
  createUser: (userData) => apiClient.post('/admin/users', userData),

  // Delete user
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),

  // Get drivers for verification
  getDriversForVerification: (status) =>
    apiClient.get('/admin/drivers/verification', { params: { status } }),

  // Verify/reject driver
  verifyDriver: (driverId, isVerified, rejectionReason = null) =>
    apiClient.put(`/admin/drivers/${driverId}/verify`, null, {
      params: { is_verified: isVerified, rejection_reason: rejectionReason }
    }),

  // Verify vehicle
  verifyVehicle: (driverId, vehicleId, isVerified) =>
    apiClient.put(`/admin/drivers/${driverId}/vehicles/${vehicleId}/verify`, null, {
      params: { is_verified: isVerified }
    }),

  // Get all rides
  getRides: (params) => apiClient.get('/admin/rides', { params }),

  // --- Safety Incidents ---
  getSafetyIncidents: (severity, status) =>
    apiClient.get('/admin/safety/incidents', { params: { severity, status } }),

  updateIncidentStatus: (id, status, reply) =>
    apiClient.put(`/admin/safety/incidents/${id}/status`, { status, reply }),

  deleteIncident: (id) => apiClient.delete(`/admin/safety/incidents/${id}`),

  // --- Support Tickets ---
  getSupportTickets: (status) =>
    apiClient.get('/admin/support/tickets', { params: { status } }),

  resolveTicket: (id, action_taken, investigation_notes) =>
    apiClient.post(`/admin/support/tickets/${id}/resolve`, { action_taken, investigation_notes }),

  updateTicket: (id, data) =>
    apiClient.put(`/admin/support/tickets/${id}`, data),

  // --- Analytics & Reports ---
  getAnalyticsOverview: (days) =>
    apiClient.get('/admin/analytics/overview', { params: { days } }),

  getAnalyticsSummary: (days) =>
    apiClient.get('/admin/analytics/summary', { params: { days } }),

  askAnalyticsAI: (question, days) =>
    apiClient.post('/admin/analytics/ask', { question, days }),

  // Get revenue analytics (Legacy/Specific)
  getRevenueAnalytics: (days = 7) =>
    apiClient.get('/admin/analytics/revenue', { params: { days } }),

  // Get pricing rules
  getPricingRules: () => apiClient.get('/admin/pricing/rules'),

  // Get analytics (legacy endpoint - for existing code)
  getAnalytics: () => apiClient.get('/admin/dashboard/stats'),
};

// ============================================
// LEGACY API (for backward compatibility)
// ============================================
export const rideAPI = {
  createRide: (rideData) => customerAPI.createRide(rideData),
  getRides: (params) => customerAPI.getRides(params?.limit),
  getRideById: (id) => customerAPI.getRideById(id),
  cancelRide: (id) => customerAPI.cancelRide(id, 'Cancelled by user'),
  acceptRide: (id) => driverAPI.acceptRide(id),
  completeRide: (id) => driverAPI.completeRide(id),
};

export const userAPI = {
  getProfile: () => customerAPI.getProfile(),
  getDrivers: (params) => adminAPI.getUsers({ ...params, role: 'driver' }),
  getCustomers: (params) => adminAPI.getUsers({ ...params, role: 'customer' }),
};

// ============================================
// REAL-TIME RIDE API (AppRideController)
// ============================================
export const appRideAPI = {
  updateDriverStatus: (data) => apiClient.put('/drivers/status', data),
  searchDrivers: (data) => apiClient.post('/rides/request', data),
  getPendingRides: () => apiClient.get('/rides/pending'),
  acceptRide: (rideId) => apiClient.put(`/rides/accept/${rideId}`),
  getCustomerActiveRides: (customerId) => apiClient.get(`/rides/customer/${customerId}`),
  completeRide: (rideId) => apiClient.put(`/rides/complete/${rideId}`),
  getCustomerRideHistory: (customerId) => apiClient.get(`/rides/history/customer/${customerId}`),
  getDriverRideHistory: (driverId) => apiClient.get(`/rides/history/driver/${driverId}`),
};

export default apiClient;
