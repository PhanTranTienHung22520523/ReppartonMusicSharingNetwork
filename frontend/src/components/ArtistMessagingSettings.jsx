import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ArtistMessagingSettings = () => {
  const { user } = useAuth();
  const [allowNormalUserMessages, setAllowNormalUserMessages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Check if user is an artist
  const isArtist = user && user.role && user.role.toUpperCase() === 'ARTIST';

  useEffect(() => {
    if (!isArtist) return;
    
    // Load current settings
    const loadSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${user.id}/messaging-settings`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setAllowNormalUserMessages(data.allowNormalUserMessages || false);
        }
      } catch (error) {
        console.error('Failed to load messaging settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [user, isArtist]);

  const handleToggle = async () => {
    try {
      setSaving(true);
      const newValue = !allowNormalUserMessages;
      
      const response = await fetch(`/api/users/${user.id}/messaging-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ allowNormalUserMessages: newValue }),
      });
      
      if (response.ok) {
        setAllowNormalUserMessages(newValue);
        setMessage({
          type: 'success',
          text: newValue 
            ? '✅ Normal users can now send you direct messages' 
            : '⛔ Normal users cannot send you direct messages (group chat only)'
        });
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Failed to update messaging settings:', error);
      setMessage({
        type: 'error',
        text: '❌ Failed to update settings. Please try again.'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Don't show this component for non-artists
  if (!isArtist) {
    return null;
  }

  const switchStyle = (checked) => ({
    width: 44,
    height: 24,
    background: checked ? "#a259ff" : "#e5e7eb",
    borderRadius: 24,
    position: "relative",
    border: "none",
    outline: "none",
    transition: "background 0.2s",
    display: "inline-block",
    verticalAlign: "middle",
    cursor: saving ? 'not-allowed' : 'pointer',
    opacity: saving ? 0.6 : 1,
  });
  
  const knobStyle = (checked) => ({
    position: "absolute",
    left: checked ? 22 : 2,
    top: 2,
    width: 20,
    height: 20,
    background: "#fff",
    borderRadius: "50%",
    transition: "left 0.2s",
    boxShadow: "0 1px 4px #0002"
  });

  if (loading) {
    return (
      <div className="card p-4 mb-4" style={{width: 700, borderRadius: 20}}>
        <div className="text-center">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Loading messaging settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 mb-4" style={{width: 700, borderRadius: 20}}>
      <h5 className="mb-3" style={{color: "#a259ff"}}>
        <i className="bi bi-chat-dots me-2"></i>Artist Messaging Settings
      </h5>
      
      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-3`} role="alert">
          {message.text}
        </div>
      )}
      
      <div className="d-flex align-items-center justify-content-between p-3" 
           style={{background: "#fafbfc", borderRadius: 12}}>
        <div>
          <b>Allow Normal Users to Send Direct Messages</b>
          <div className="text-muted small">
            {allowNormalUserMessages 
              ? "Normal users can send you direct messages (DMs)" 
              : "Normal users can only message you in group chats"}
          </div>
          <div className="text-muted small mt-1">
            <i className="bi bi-info-circle me-1"></i>
            {allowNormalUserMessages
              ? "You will receive DMs from all users"
              : "Group chats are still available for normal users to contact you"}
          </div>
        </div>
        <button
          style={switchStyle(allowNormalUserMessages)}
          onClick={handleToggle}
          disabled={saving}
          type="button"
          title={allowNormalUserMessages ? "Click to disable" : "Click to enable"}
        >
          <span style={knobStyle(allowNormalUserMessages)}></span>
        </button>
      </div>
      
      <div className="mt-3 p-3" style={{background: "#fff9e6", borderRadius: 12}}>
        <div className="d-flex">
          <i className="bi bi-lightbulb text-warning me-2"></i>
          <div className="small">
            <b>How it works:</b>
            <ul className="mb-0 mt-2">
              <li>When <b>enabled</b>: Normal users can send you direct 1-on-1 messages</li>
              <li>When <b>disabled</b> (default): Normal users can only reach you through group chats</li>
              <li>Artists can always message each other regardless of this setting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistMessagingSettings;
