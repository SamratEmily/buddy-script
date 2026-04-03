import React, { useEffect, useState, useCallback } from 'react';
import { getLikers } from '../../../services/api';

interface Liker {
  id: number;
  name: string;
  avatar: string | null;
}

interface LikersModalProps {
  type: 'post' | 'comment';
  id: number | string;
  onClose: () => void;
}

const LikersModal: React.FC<LikersModalProps> = ({ type, id, onClose }) => {
  const [likers, setLikers] = useState<Liker[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLikers = useCallback(async () => {
    setLoading(true);
    const data = await getLikers(type, id);
    setLikers(data);
    setLoading(false);
  }, [type, id]);

  useEffect(() => {
    fetchLikers();
  }, [fetchLikers]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 12, width: 360, maxWidth: '90vw',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        maxHeight: '80vh',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #f0f0f0',
        }}>
          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1a1a2e' }}>
            ❤️ People who liked this
          </h4>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 20, color: '#888', lineHeight: 1, padding: '0 4px',
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#999' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
              Loading...
            </div>
          ) : likers.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#bbb' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💔</div>
              No likes yet
            </div>
          ) : (
            likers.map((liker) => (
              <div
                key={liker.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 20px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f9f9f9')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', overflow: 'hidden',
                  background: '#e8eaf0', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 16, color: '#556',
                }}>
                  {liker.avatar ? (
                    <img src={liker.avatar} alt={liker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    liker.name?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>

                {/* Name */}
                <span style={{ fontSize: 14, fontWeight: 500, color: '#222' }}>
                  {liker.name || 'Unknown User'}
                </span>

                {/* Heart badge */}
                <span style={{ marginLeft: 'auto', fontSize: 14 }}>❤️</span>
              </div>
            ))
          )}
        </div>

        {/* Footer count */}
        {!loading && likers.length > 0 && (
          <div style={{
            borderTop: '1px solid #f0f0f0', padding: '10px 20px',
            fontSize: 12, color: '#999', textAlign: 'center',
          }}>
            {likers.length} {likers.length === 1 ? 'person' : 'people'} liked this
          </div>
        )}
      </div>
    </div>
  );
};

export default LikersModal;
