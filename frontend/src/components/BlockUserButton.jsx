import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaBan, FaCheckCircle } from 'react-icons/fa';
import * as userApi from '../api/userService';
import ConfirmModal from './ConfirmModal';

export default function BlockUserButton({ targetUserId, targetUsername, onBlockStatusChange }) {
  const { user } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    checkBlockStatus();
  }, [targetUserId]);

  const checkBlockStatus = async () => {
    if (!user || !targetUserId || user.id === targetUserId) return;
    
    try {
      const blocked = await userApi.isUserBlocked(user.id, targetUserId);
      setIsBlocked(blocked);
    } catch (error) {
      console.error('Failed to check block status:', error);
    }
  };

  const handleBlockToggle = async () => {
    if (!user || loading) return;

    if (isBlocked) {
      setLoading(true);
      try {
        await userApi.unblockUser(user.id, targetUserId);
        setIsBlocked(false);
        if (onBlockStatusChange) onBlockStatusChange(false);
      } catch (error) {
        console.error('Failed to update block status:', error);
        alert(error.message || 'Failed to update block status');
      } finally {
        setLoading(false);
      }
      return;
    }

    setShowConfirm(true);
  };

  const confirmBlock = async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      await userApi.blockUser(user.id, targetUserId);
      setIsBlocked(true);
      if (onBlockStatusChange) onBlockStatusChange(true);
      setShowConfirm(false);
    } catch (error) {
      console.error('Failed to update block status:', error);
      alert(error.message || 'Failed to update block status');
    } finally {
      setLoading(false);
    }
  };

  // Don't show button for own profile
  if (!user || user.id === targetUserId) return null;

  return (
    <>
      <button
        className={`btn ${isBlocked ? 'btn-success' : 'btn-danger'} btn-sm`}
        onClick={handleBlockToggle}
        disabled={loading}
      >
        {loading ? (
          <span className="spinner-border spinner-border-sm me-2" />
        ) : isBlocked ? (
          <FaCheckCircle className="me-2" />
        ) : (
          <FaBan className="me-2" />
        )}
        {isBlocked ? 'Unblock' : 'Block User'}
      </button>

      <ConfirmModal
        show={showConfirm}
        title="Block user"
        message={`Are you sure you want to block ${targetUsername || 'this user'}? You won't see their content anymore.`}
        confirmText="Block"
        cancelText="Cancel"
        confirmVariant="danger"
        loading={loading}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmBlock}
      />
    </>
  );
}
