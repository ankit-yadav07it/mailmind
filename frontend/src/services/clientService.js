import api from './api';

export const clientService = {
  getAttention: () => api.get('/client/attention'),
  markHandled: (id) => api.patch(`/client/conversations/${id}/handled`),
  takeOver: (id) => api.patch(`/client/conversations/${id}/take-over`),
};
