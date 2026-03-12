import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// Auth APIs
export const sendOtp = (email) => api.post('/auth/send-otp', { email });
export const verifyOtp = (email, otp) => api.post('/auth/verify-otp', { email, otp });
export const adminLogin = (email, password) => api.post('/auth/admin/login', { email, password });
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');

// Profile
export const updateProfile = (data) => api.put('/users/profile', data);

// Locations
export const getStates = () => api.get('/locations/states');
export const getDistricts = (stateId) => api.get(`/locations/districts?stateId=${stateId}`);
export const getMandals = (districtId) => api.get(`/locations/mandals?districtId=${districtId}`);
export const getVillages = (mandalId) => api.get(`/locations/villages?mandalId=${mandalId}`);

// Complaints (User)
export const createComplaint = (data) => api.post('/complaints', data);
export const getMyComplaints = (page = 0, size = 10) => api.get(`/complaints/my?page=${page}&size=${size}`);
export const getComplaint = (complaintId) => api.get(`/complaints/${complaintId}`);
export const getMyNotifications = () => api.get('/complaints/my/notifications');

// Upload
export const uploadImage = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// Admin APIs
export const getAdminComplaints = (params) => api.get('/admin/complaints', { params });
export const getAdminComplaint = (complaintId) => api.get(`/admin/complaints/${complaintId}`);
export const getHighPriorityComplaints = (limit = 5) => api.get(`/admin/complaints/high-priority?limit=${limit}`);

// Updated to support reason
export const updateComplaintStatus = (complaintId, fromStatus, toStatus, reason = null) =>
    api.put(`/admin/complaints/${complaintId}/status`, { fromStatus, toStatus, reason });

export const updateComplaintPriority = (complaintId, priority) =>
    api.put(`/admin/complaints/${complaintId}/priority`, { priority });

export const getDashboardStats = () => api.get('/admin/dashboard/stats');

export const getAdminUsers = (page = 0, size = 20) =>
    api.get(`/admin/users?page=${page}&size=${size}`);

export const updateUserStatus = (userId, status, reason = null) =>
    api.put(`/admin/users/${userId}/status`, { status, reason });

// Admin Management (Super Admin)
export const getAdminList = () => api.get('/admin/admins');
export const createAdmin = (data) => api.post('/admin/admins', data);
export const deleteAdmin = (adminId) => api.delete(`/admin/admins/${adminId}`);

export default api;
