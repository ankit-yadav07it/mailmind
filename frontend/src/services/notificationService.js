import api from './api';

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAllRead: () => api.patch('/notifications/read-all'),
};
