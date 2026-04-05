import React, { useState, useEffect } from 'react';
import { BADGES } from '../utils/gamification';

const animations = `
  @keyframes popIn {
    0% { transform: scale(0); opacity: 0; }
    70% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes fall {
    0% { top: -10px; opacity: 1; }
    100% { top: 110vh; opacity: 0; transform: rotate(720deg); }
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

export default function XPCelebration({ xp, newBadges, levelUp }) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{animations}</style>
      <div style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* XP popup */}
        <div style={{
          background: 'linear-gradient(135deg, #0D1B4B, #0D9488)',
          borderRadius: '24px',
          padding: '32px 48px',
          textAlign: 'center',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          animation: 'popIn 0.5s ease',
          pointerEvents: 'all'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>
            {xp >= 200 ? '🎉' : '⭐'}
          </div>
          <p style={{
            color: '#FBBF24',
            fontSize: '48px',
            fontWeight: '900',
            margin: '0 0 4px'
          }}>
            +{xp} XP
          </p>
          <p style={{
            color: '#FFFFFF',
            fontSize: '16px',
            margin: '0 0 16px'
          }}>
            {xp >= 250 ? 'AMAZING! 🔥' : xp >= 150 ? 'Great job! ⚡' : 'Keep going! 💪'}
          </p>

          {levelUp && (
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '12px 20px',
              marginBottom: '12px',
              animation: 'slideUp 0.5s ease 0.3s both'
            }}>
              <p style={{
                color: '#FBBF24',
                fontWeight: '800',
                fontSize: '18px',
                margin: 0
              }}>
                🆙 LEVEL UP! You are now {levelUp.name}!
              </p>
            </div>
          )}

          {newBadges?.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px',
              animation: 'slideUp 0.5s ease 0.6s both'
            }}>
              <p style={{
                color: '#FFFFFF',
                fontSize: '14px',
                margin: '0 0 8px'
              }}>
                🏅 New Badge{newBadges.length > 1 ? 's' : ''}!
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {newBadges.map(badgeId => {
                  const badge = BADGES.find(b => b.id === badgeId);
                  return badge ? (
                    <div key={badgeId} style={{
                      background: badge.color,
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '13px',
                      color: '#FFFFFF',
                      fontWeight: '600'
                    }}>
                      {badge.icon} {badge.name}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Confetti particles */}
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{
            position: 'fixed',
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: ['#FBBF24','#10B981','#0D9488','#EF4444','#8B5CF6','#F59E0B'][i % 6],
            animation: `fall ${1 + Math.random() * 2}s ${Math.random() * 0.5}s linear forwards`
          }}/>
        ))}
      </div>
    </>
  );
}
