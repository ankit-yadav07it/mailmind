import api from './api';

export const getConversations = async (params) => {
  const res = await api.get('/conversations', { params });
  return res.data;
};

export const getConversation = async (id) => {
  const res = await api.get(`/conversations/${id}`);
  return res.data;
};

export const updateConversation = async (id, data) => {
  const res = await api.patch(`/conversations/${id}`, data);
  return res.data;
};

export const getDashboardStats = async () => {
  const res = await api.get('/dashboard/stats');
  return res.data;
};

export const conversationService = {
  getConversations,
  getConversation,
  updateConversation,
  getDashboardStats,
};

export default conversationService;
