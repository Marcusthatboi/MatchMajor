import { api } from './index';

const API_URL = '/chat-requests';

export const getChatRequests = async () => {
  try {
    return await api.get(API_URL, { skipCache: true });
  } catch (error) {
    console.error('Get chat requests error:', error);
    throw error;
  }
};

export const sendChatRequest = async (recipientId) => {
  try {
    return await api.post(API_URL, { recipientId });
  } catch (error) {
    console.error('Send chat request error:', error);
    throw error;
  }
};

export const acceptChatRequest = async (requestId) => {
  try {
    return await api.put(`${API_URL}/${requestId}/accept`);
  } catch (error) {
    console.error('Accept chat request error:', error);
    throw error;
  }
};

export const declineChatRequest = async (requestId) => {
  try {
    return await api.put(`${API_URL}/${requestId}/decline`);
  } catch (error) {
    console.error('Decline chat request error:', error);
    throw error;
  }
};
