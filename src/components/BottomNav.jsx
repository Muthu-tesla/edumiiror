import React from 'react';

export default function BottomNav({ currentPage, onNavigate }) {
  const tabs = [
    { id: 'aspirantHome', icon: '🏠', label: 'Home' },
    { id: 'aspirantTest', icon: '📝', label: 'Test' },
    { id: 'leaderboard', icon: '🏆', label: 'Ranks' },
    { id: 'badges', icon: '🏅', label: 'Badges' },
    { id: 'profilePage', icon: '👤', label: 'Profile' }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#FFFFFF',
      borderTop: '1px solid #E2E8F0',
      display: 'flex',
      zIndex: 100,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
    }}>
      {tabs.map(tab => {
        // Simple mapping to handle active state
        let active = currentPage === tab.id;
        if (tab.id === 'aspirantHome' && (currentPage === 'studentHome' || currentPage === 'teacherDashboard')) {
          active = true;
        }

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id === 'aspirantHome' ? 'home' : tab.id)}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              cursor: 'pointer',
              borderTop: active 
                ? '3px solid #0D9488' : '3px solid transparent'
            }}
          >
            <span style={{ fontSize: '22px' }}>
              {tab.icon}
            </span>
            <span style={{
              fontSize: '10px',
              color: active ? '#0D9488' : '#94A3B8',
              fontWeight: active ? '700' : '400',
              fontFamily: 'inherit'
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
