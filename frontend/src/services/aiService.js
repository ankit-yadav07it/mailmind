import api from './api';

export const aiService = {
  classify: (conversationId) => api.post('/ai/classify', { conversationId }),
  summarize: (conversationId) => api.post('/ai/summarize', { conversationId }),
  generateReply: (conversationId, opts = {}) => api.post('/ai/generate-reply', { conversationId, ...opts }),
  extractEvents: (conversationId) => api.post('/ai/extract-events', { conversationId }),
};
