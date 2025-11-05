import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';
import GlobalNavbar from '../../components/layout/GlobalNavbar.jsx';
import { apiListNotifications, apiMarkAllNotificationsRead, apiDeleteSelectedNotifications, apiDeleteAllNotifications } from '../../services/notifications.js';
import { SOCKET_ENABLED } from '../../services/api.js';
import { getSocket } from '../../services/socket.js';
import Spinner from '../../components/ui/Spinner.jsx';
import { useToast } from '../../components/Toast/ToastContext.jsx';
import './Notifications.css';

export default function Notifications(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const { notify } = useToast();

  useEffect(()=>{ (async ()=>{
    try { 
      const List = await apiListNotifications(); 
      setItems(List); 
    }
    catch(e){ 
      setErr(e?.message||'Failed to load notifications'); 
    }
    finally { 
      setLoading(false); 
    }
  })(); }, []);

  useEffect(()=>{
    if(!SOCKET_ENABLED) return;
    let mounted = true;
    (async ()=>{
      try {
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const sock = await getSocket(baseUrl);
        sock.on('notification:new', ({ userId, item })=>{
          if(!mounted) return;
          setItems(prev => [item, ...prev]);
          // Show browser notification for new items
          if (!item.read && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('UnityBoard', {
              body: item.message,
              icon: '/favicon.ico'
            });
          }
        });
      } catch {/* ignore */}
    })();
    return ()=>{ mounted=false; };
  }, []);

  async function markAllAsRead(){
    try { 
      await apiMarkAllNotificationsRead(); 
      setItems(items.map(n=>({...n, read:true }))); 
      notify('All notifications marked as read','success');
      
      // Emit event to update navbar unread count
      window.dispatchEvent(new CustomEvent('notifications-all-read'));
    }
    catch { 
      notify('Failed to mark notifications as read','error'); 
    }
  }

  function toggleSelectMode() {
    setSelectMode(!selectMode);
    setSelectedItems(new Set());
  }

  function toggleSelectItem(itemId) {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  }

  function selectAllItems() {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item._id)));
    }
  }

  async function deleteSelected() {
    if (selectedItems.size === 0) return;
    
    setDeleting(true);
    try {
      const selectedCount = selectedItems.size;
      await apiDeleteSelectedNotifications(Array.from(selectedItems));
      
      // Remove from local state
      const remainingItems = items.filter(item => !selectedItems.has(item._id));
      setItems(remainingItems);
      setSelectedItems(new Set());
      setSelectMode(false);
      notify(`Deleted ${selectedCount} notifications`, 'success');
      
      // Update navbar unread count
      const newUnreadCount = remainingItems.filter(item => !item.read).length;
      window.dispatchEvent(new CustomEvent('notifications-changed', { 
        detail: { unreadCount: newUnreadCount } 
      }));
    } catch (e) {
      notify('Failed to delete notifications', 'error');
    } finally {
      setDeleting(false);
    }
  }

  async function deleteAll() {
    if (items.length === 0) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete all ${items.length} notifications? This cannot be undone.`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      const deletedCount = await apiDeleteAllNotifications();
      
      // Clear local state
      setItems([]);
      setSelectedItems(new Set());
      setSelectMode(false);
      notify(`Deleted ${deletedCount} notifications`, 'success');
      
      // Update navbar unread count to 0
      window.dispatchEvent(new CustomEvent('notifications-changed', { 
        detail: { unreadCount: 0 } 
      }));
    } catch (e) {
      notify('Failed to delete all notifications', 'error');
    } finally {
      setDeleting(false);
    }
  }

  function getNotificationIcon(type) {
    switch (type) {
      case 'member_joined': return '👋';
      case 'task_assigned': return '📋';
      case 'task_assigned_confirmation': return '✅';
      case 'task_due': return '⏰';
      case 'task_due_admin': return '⚠️';
      case 'member_left': return '👋';
      case 'project_joined': return '🎉';
      case 'project_invite': return '📨';
      case 'test_message': return '🧪';
      default: return '📢';
    }
  }

  function formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  }

  const unreadCount = items.filter(item => !item.read).length;

  return (
    <AppLayout sidebar={<Sidebar />} topbar={<GlobalNavbar />}> 
      <div className="container">
        <div className="notifications-page">
          {/* Header */}
          <div className="notifications-header">
            <div className="header-title">
              <h1>Notifications</h1>
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount} unread</span>
              )}
            </div>
            <p>Stay updated with your project activities and team interactions</p>
          </div>

          {/* Error Message */}
          {err && <div className="error-message">{err}</div>}

          {/* Loading State */}
          {loading && <Spinner />}

          {/* Controls */}
          {!loading && !err && items.length > 0 && (
            <div className="notifications-controls">
              <div className="controls-left">
                <button className="btn btn-secondary" onClick={markAllAsRead}>
                  Mark All as Read
                </button>
                <button 
                  className={`btn ${selectMode ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={toggleSelectMode}
                >
                  {selectMode ? 'Cancel Select' : 'Select'}
                </button>
                {selectMode && (
                  <button className="btn btn-secondary" onClick={selectAllItems}>
                    {selectedItems.size === items.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>
              <div className="controls-right">
                {selectMode && selectedItems.size > 0 && (
                  <button 
                    className="btn btn-danger" 
                    onClick={deleteSelected}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : `Delete Selected (${selectedItems.size})`}
                  </button>
                )}
                <button 
                  className="btn btn-danger" 
                  onClick={deleteAll}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete All'}
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !err && items.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <h3>No notifications yet</h3>
              <p>When you join projects or get assigned tasks, notifications will appear here.</p>
            </div>
          )}

          {/* Notifications List */}
          {!loading && !err && items.length > 0 && (
            <div className="notifications-list">
              {items.map(notification => (
                <div 
                  key={notification._id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''} ${selectMode ? 'selectable' : ''}`}
                >
                  {selectMode && (
                    <div className="notification-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(notification._id)}
                        onChange={() => toggleSelectItem(notification._id)}
                      />
                    </div>
                  )}
                  
                  <div className="notification-content">
                    <div className="notification-header">
                      <div className="notification-icon">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="notification-text">
                        <div className="notification-message">
                          {notification.message}
                        </div>
                        <div className="notification-meta">
                          <span className="notification-time">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {notification.projectName && (
                            <>
                              <span className="meta-separator">•</span>
                              <span className="notification-project">
                                {notification.projectName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {!notification.read && <div className="unread-dot"></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
