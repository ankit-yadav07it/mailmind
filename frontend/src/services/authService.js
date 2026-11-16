import api from './api';

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (name, email, password, role) => api.post('/auth/register', { name, email, password, role });
export const getMe = () => api.get('/auth/me');

export const authService = { login, register, getMe };
export default authService;
