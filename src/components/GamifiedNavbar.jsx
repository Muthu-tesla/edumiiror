import React from 'react';
import { getCurrentLevel, getLevelProgress } from '../utils/gamification';

export default function GamifiedNavbar({ userProfile, user, onLogout, onHome }) {
  const currentLevel = getCurrentLevel(userProfile?.totalXP || 0);
  const levelProgress = getLevelProgress(userProfile?.totalXP || 0);
  const totalXP = userProfile?.totalXP || 0;
  const coins = userProfile?.coins || 0;
  const studyStreak = userProfile?.studyStreak || 0;

  return (
    <nav style={{
      background: '#0D1B4B',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
      fontFamily: 'inherit'
    }}>
      {/* Logo */}
      <div 
        onClick={onHome}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: '24px' }}>📚</span>
        <span style={{ color: '#0D9488', fontWeight: '900', fontSize: '20px', letterSpacing: '-0.5px' }}>
          EduMirror Pro
        </span>
      </div>

      {/* Center - Level info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        {/* Level badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '6px 14px'
        }}>
          <span style={{ fontSize: '18px' }}>
            {currentLevel.icon}
          </span>
          <div>
            <p style={{
              color: currentLevel.color,
              fontWeight: '700',
              fontSize: '12px',
              margin: '0 0 2px 0'
            }}>
              {currentLevel.name}
            </p>
            <div style={{
              height: '4px',
              width: '80px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '2px'
            }}>
              <div style={{
                height: '100%',
                width: `${levelProgress}%`,
                background: currentLevel.color,
                borderRadius: '2px',
                transition: 'width 0.3s'
              }}/>
            </div>
          </div>
        </div>

        {/* XP display */}
        <div style={{
          background: 'rgba(251,191,36,0.15)',
          borderRadius: '20px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ fontSize: '14px' }}>⚡</span>
          <span style={{ color: '#FBBF24', fontWeight: '700', fontSize: '13px' }}>
            {totalXP.toLocaleString()} XP
          </span>
        </div>

        {/* Coins */}
        <div style={{
          background: 'rgba(245,158,11,0.15)',
          borderRadius: '20px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ fontSize: '14px' }}>🪙</span>
          <span style={{ color: '#F59E0B', fontWeight: '700', fontSize: '13px' }}>
            {coins}
          </span>
        </div>

        {/* Streak */}
        <div style={{
          background: 'rgba(239,68,68,0.15)',
          borderRadius: '20px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ fontSize: '14px' }}>🔥</span>
          <span style={{ color: '#EF4444', fontWeight: '700', fontSize: '13px' }}>
            {studyStreak}
          </span>
        </div>
      </div>

      {/* Right - Profile & logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px', height: '36px',
          borderRadius: '50%',
          background: '#0D9488',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontWeight: '800',
          fontSize: '16px'
        }}>
          {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <button onClick={onLogout} style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          padding: '7px 14px',
          color: '#FFFFFF',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '600',
          fontFamily: 'inherit'
        }}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}
