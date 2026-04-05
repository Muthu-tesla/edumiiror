import React from 'react';
import { BADGES } from '../../utils/gamification';

export default function BadgesPage({ profile }) {
  const userBadges = profile?.badges || [];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px', minHeight: '100vh', paddingBottom: '100px' }}>
      <h2 style={{ fontSize: '28px', color: '#0D1B4B', marginBottom: '8px' }}>🏅 Achievements</h2>
      <p style={{ color: '#64748B', marginBottom: '32px', fontSize: '15px' }}>
        You have unlocked {userBadges.length} out of {BADGES.length} badges! Keep studying to collect them all.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }}>
        {BADGES.map((badge) => {
          const earned = userBadges.includes(badge.id);
          return (
            <div key={badge.id} style={{
              background: earned ? '#FFFFFF' : '#F8FAFC',
              borderRadius: '20px',
              padding: '24px 16px',
              textAlign: 'center',
              border: '2px solid',
              borderColor: earned ? badge.color : '#E2E8F0',
              opacity: earned ? 1 : 0.6,
              transition: 'all 0.2s',
              boxShadow: earned ? `0 8px 24px ${badge.color}33` : 'none'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '12px',
                filter: earned ? 'none' : 'grayscale(100%)',
                transform: earned ? 'scale(1.1)' : 'scale(1)'
              }}>
                {badge.icon}
              </div>
              <p style={{
                margin: '0 0 6px',
                fontWeight: '800',
                fontSize: '15px',
                color: earned ? badge.color : '#94A3B8'
              }}>
                {badge.name}
              </p>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: '#64748B',
                lineHeight: '1.4'
              }}>
                {badge.desc}
              </p>
              {earned && (
                <div style={{
                  marginTop: '12px',
                  background: badge.color,
                  color: '#FFFFFF',
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  display: 'inline-block'
                }}>
                  EARNED ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
