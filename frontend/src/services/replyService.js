import api from './api';

export const replyService = {
  getDrafts: () => api.get('/replies'),
  updateDraft: (id, body) => api.patch(`/replies/${id}`, { body }),
  sendDraft: (id) => api.post(`/replies/${id}/send`),
};
