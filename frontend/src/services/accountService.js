import api from './api';

export const accountService = {
  getAccounts: () => api.get('/accounts'),
  connectAccount: (provider, email) => api.post('/accounts/connect', { provider, email }),
  deleteAccount: (id) => api.delete(`/accounts/${id}`),
};
