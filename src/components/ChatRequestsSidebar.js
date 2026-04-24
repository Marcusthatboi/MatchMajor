import React, { useEffect, useState } from 'react';
import { acceptChatRequest, declineChatRequest, getChatRequests } from '../api/chatRequests';
import './ChatRequestsSidebar.css';

const getDisplayName = (user) => user?.username || user?.name || 'Student';

const ChatRequestsSidebar = ({ refreshKey = 0 }) => {
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await getChatRequests();
      if (response.success) {
        setRequests(response.data || { incoming: [], outgoing: [] });
        setError(null);
      } else {
        setError(response.message || 'Could not load chat requests');
      }
    } catch (requestError) {
      setError(requestError.message || 'Could not load chat requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [refreshKey]);

  const handleAccept = async (requestId) => {
    try {
      const response = await acceptChatRequest(requestId);
      if (response.success) {
        await loadRequests();
      } else {
        setError(response.message || 'Could not accept request');
      }
    } catch (acceptError) {
      setError(acceptError.message || 'Could not accept request');
    }
  };

  const handleDecline = async (requestId) => {
    try {
      const response = await declineChatRequest(requestId);
      if (response.success) {
        await loadRequests();
      } else {
        setError(response.message || 'Could not decline request');
      }
    } catch (declineError) {
      setError(declineError.message || 'Could not decline request');
    }
  };

  return (
    <aside className="chat-requests-sidebar">
      <h2>Chat Requests</h2>
      {loading ? (
        <p className="chat-request-empty">Loading...</p>
      ) : (
        <>
          {error && <p className="chat-request-error">{error}</p>}

          <section className="chat-request-section">
            <h3>Incoming</h3>
            {requests.incoming?.length ? (
              requests.incoming.map((request) => (
                <div className="chat-request-card" key={request._id}>
                  <strong>{getDisplayName(request.requester)}</strong>
                  <small>wants to chat</small>
                  <div className="chat-request-actions">
                    <button type="button" onClick={() => handleAccept(request._id)}>Accept</button>
                    <button type="button" className="secondary" onClick={() => handleDecline(request._id)}>Decline</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="chat-request-empty">No incoming requests</p>
            )}
          </section>

          <section className="chat-request-section">
            <h3>Sent</h3>
            {requests.outgoing?.length ? (
              requests.outgoing.map((request) => (
                <div className="chat-request-card compact" key={request._id}>
                  <strong>{getDisplayName(request.recipient)}</strong>
                  <small>pending</small>
                </div>
              ))
            ) : (
              <p className="chat-request-empty">No pending sent requests</p>
            )}
          </section>

        </>
      )}
    </aside>
  );
};

export default ChatRequestsSidebar;
