import React, { useEffect, useState, useRef } from 'react';
import { useToast } from '../../../../components/Toast/ToastContext.jsx';
import { getSocket } from '../../../../services/socket.js';
import { SOCKET_ENABLED, API } from '../../../../services/api.js';
import { apiListMessages, apiCreateMessage, apiListThreads, apiCreateThread } from '../../../../services/discussion.js';
import Avatar from '../../../../components/ui/Avatar.jsx';
import './ChatPanel.css';



export default function ChatPanel({ projectId, me, project }) {
  const { notify } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages from backend
  useEffect(() => {
    if (!projectId) return;
    
    (async () => {
      try {
        setLoading(true);
        // Get or create General thread for this project
        const threadsData = await apiListThreads(projectId);
        
        let generalThread = threadsData.items?.find(t => t.title === 'General');
        if (!generalThread) {
          const createData = await apiCreateThread(projectId, { title: 'General', tags: [] });
          generalThread = createData.item;
        }

        if (generalThread) {
          setThreadId(generalThread._id);
          const messagesRes = await apiListMessages(generalThread._id);
          if (messagesRes.ok) {
            setMessages(messagesRes.items || []);
          }
        }
      } catch (error) {
        console.error('Failed to load chat:', error);
        notify('Failed to load chat', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId, notify]);

  // Socket for real-time messages
  useEffect(() => {
    if (!SOCKET_ENABLED || !threadId) return;
    let mounted = true;
    
    (async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const sock = await getSocket(baseUrl);
        sock.emit('join', { projectId });
        
        const onNewMessage = ({ threadId: msgThreadId, item }) => {
          if (!mounted || msgThreadId !== threadId) return;
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(msg => msg._id === item._id)) return prev;
            return [...prev, item];
          });
        };
        
        sock.on('message:new', onNewMessage);
        
        return () => {
          sock.off('message:new', onNewMessage);
          sock.emit('leave', { projectId });
        };
      } catch (error) {
        console.error('Socket connection failed:', error);
      }
    })();

    return () => { mounted = false; };
  }, [projectId, threadId]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !threadId) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear immediately for better UX
    
    try {
      setSending(true);
      
      const messageRes = await apiCreateMessage(threadId, { text: messageText });
      if (!messageRes.ok) {
        notify('Failed to send message', 'error');
        setNewMessage(messageText); // Restore message on failure
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      notify('Failed to send message', 'error');
      setNewMessage(messageText); // Restore message on failure
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diff < 604800000) return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  // Helper functions for user info
  const getUserName = (user) => {
    if (!user) return 'Unknown User';
    
    // If user is current user
    const currentUserId = String(me?.id || me?._id || '');
    const messageUserId = String(user._id || user.id || user);
    
    if (messageUserId === currentUserId) {
      return 'You';
    }
    
    // If user object has name properties  
    if (typeof user === 'object') {
      return user.name || 'Unknown User';
    }
    
    // If user is just an ID, try to find in project members
    if (project?.members) {
      const member = project.members.find(m => {
        const memberId = String(m.user?._id || m.user?.id || m.user || '');
        return memberId === messageUserId;
      });
      
      if (member?.user && typeof member.user === 'object') {
        return member.user.name || 'Unknown User';
      }
    }
    
    return 'Unknown User';
  };



  const isCurrentUser = (user) => {
    const currentUserId = String(me?.id || me?._id || '');
    const messageUserId = String(user?._id || user?.id || user || '');
    return messageUserId === currentUserId;
  };

  if (loading) {
    return (
      <div className="chat-panel">
        <div className="chat-header">
          <div className="chat-info">
            <h3>💬 Team Chat</h3>
            <p>Loading messages...</p>
          </div>
        </div>
        <div className="chat-messages">
          <div className="chat-loading">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-panel">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-info">
          <h3>💬 {project?.name || 'Team Chat'}</h3>
          <p>{project?.members?.length || 0} member{project?.members?.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="empty-icon">💬</div>
            <p>No messages yet</p>
            <p className="empty-subtitle">Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isMe = isCurrentUser(msg.user);
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const showAvatar = !prevMsg || !isCurrentUser(prevMsg.user) === !isMe || 
                String(prevMsg.user?._id || prevMsg.user) !== String(msg.user?._id || msg.user);
              
              return (
                <div key={msg._id || index} className={`message ${isMe ? 'message-me' : 'message-other'}`}>
                  {!isMe && (
                    <div className="message-avatar-wrapper">
                      {showAvatar ? (
                        <div className="message-avatar">
                          <Avatar user={msg.user} size="small" />
                        </div>
                      ) : (
                        <div className="message-avatar-spacer"></div>
                      )}
                    </div>
                  )}
                  <div className="message-content">
                    {!isMe && showAvatar && (
                      <div className="message-author">{getUserName(msg.user)}</div>
                    )}
                    <div className="message-bubble">
                      <div className="message-text">{msg.text}</div>
                      <div className="message-time">{formatTime(msg.createdAt)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
          className="message-input"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="send-button"
          aria-label="Send message"
        >
          {sending ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  );
}