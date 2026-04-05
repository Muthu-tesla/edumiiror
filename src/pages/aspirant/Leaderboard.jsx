import React, { useState, useEffect } from 'react';
import { loadLeaderboard } from '../../firebase';
import { getCurrentLevel } from '../../utils/gamification';

export default function Leaderboard({ currentUserId }) {
  const [leaders, setLeaders] = useState([]);
  const [tab, setTab] = useState('global');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard().then(data => {
      setLeaders(data);
      setLoading(false);
    });
  }, []);

  const getRankStyle = (rank) => {
    if (rank === 1) return { bg: '#FFF7E6', color: '#F59E0B', icon: '🥇' };
    if (rank === 2) return { bg: '#F1F5F9', color: '#94A3B8', icon: '🥈' };
    if (rank === 3) return { bg: '#FFF3E6', color: '#CD7C2F', icon: '🥉' };
    return { bg: '#FFFFFF', color: '#64748B', icon: `#${rank}` };
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#0D9488' }}>Loading Leaderboard...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px', minHeight: '100vh', paddingBottom: '100px' }}>
      <h2 style={{ fontSize: '28px', color: '#0D1B4B', marginBottom: '24px' }}>🏆 Leaderboard</h2>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['global', 'class'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 24px',
              borderRadius: '20px',
              border: 'none',
              background: tab === t ? '#0D1B4B' : '#E2E8F0',
              color: tab === t ? '#FFFFFF' : '#64748B',
              cursor: 'pointer',
              fontWeight: '700',
              fontFamily: 'inherit',
              textTransform: 'capitalize'
            }}
          >
            {t === 'global' ? '🌍 Global' : '🏫 My Class'}
          </button>
        ))}
      </div>

      {leaders.length >= 3 && tab === 'global' && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: '8px',
          marginBottom: '32px',
          padding: '24px 16px 0',
          background: 'linear-gradient(135deg, #0D1B4B, #0D9488)',
          borderRadius: '20px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          {/* 2nd place */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '32px' }}>🥈</div>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', background: '#94A3B8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '8px auto', fontSize: '20px', fontWeight: '800', color: '#FFFFFF'
            }}>
              {leaders[1]?.name?.charAt(0) || 'U'}
            </div>
            <p style={{ color: '#FFFFFF', fontSize: '12px', margin: '0 0 4px', fontWeight: '600' }}>
              {leaders[1]?.name?.split(' ')[0] || 'User'}
            </p>
            <p style={{ color: '#E2E8F0', fontSize: '11px', margin: 0 }}>
              {leaders[1]?.totalXP || 0} XP
            </p>
            <div style={{ height: '60px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px 8px 0 0', marginTop: '8px' }}/>
          </div>

          {/* 1st place */}
          <div style={{ textAlign: 'center', flex: 1.2 }}>
            <div style={{ fontSize: '40px' }}>🥇</div>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%', background: '#F59E0B',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '8px auto', fontSize: '24px', fontWeight: '800', color: '#FFFFFF',
              boxShadow: '0 0 20px rgba(245,158,11,0.5)'
            }}>
              {leaders[0]?.name?.charAt(0) || 'U'}
            </div>
            <p style={{ color: '#FFFFFF', fontSize: '14px', margin: '0 0 4px', fontWeight: '700' }}>
              {leaders[0]?.name?.split(' ')[0] || 'User'}
            </p>
            <p style={{ color: '#FBBF24', fontSize: '12px', margin: 0, fontWeight: '700' }}>
              {leaders[0]?.totalXP || 0} XP
            </p>
            <div style={{ height: '90px', background: 'rgba(245,158,11,0.3)', borderRadius: '8px 8px 0 0', marginTop: '8px' }}/>
          </div>

          {/* 3rd place */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '32px' }}>🥉</div>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', background: '#CD7C2F',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '8px auto', fontSize: '20px', fontWeight: '800', color: '#FFFFFF'
            }}>
              {leaders[2]?.name?.charAt(0) || 'U'}
            </div>
            <p style={{ color: '#FFFFFF', fontSize: '12px', margin: '0 0 4px', fontWeight: '600' }}>
              {leaders[2]?.name?.split(' ')[0] || 'User'}
            </p>
            <p style={{ color: '#FFEDD5', fontSize: '11px', margin: 0 }}>
              {leaders[2]?.totalXP || 0} XP
            </p>
            <div style={{ height: '45px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px 8px 0 0', marginTop: '8px' }}/>
          </div>
        </div>
      )}

      <div>
        {leaders.map((leader, i) => {
          const isCurrentUser = leader.id === currentUserId;
          const rankStyle = getRankStyle(leader.rank);
          const level = getCurrentLevel(leader.totalXP || 0);
          
          return (
            <div key={leader.id} style={{
              background: isCurrentUser ? '#F0FDF9' : rankStyle.bg,
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              border: isCurrentUser ? '2px solid #0D9488' : '1px solid #E2E8F0',
              boxShadow: isCurrentUser ? '0 4px 12px rgba(13,148,136,0.15)' : 'none'
            }}>
              <div style={{ width: '40px', textAlign: 'center', fontWeight: '800', fontSize: '18px', color: rankStyle.color }}>
                {leader.rank <= 3 ? rankStyle.icon : `#${leader.rank}`}
              </div>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', background: level.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px'
              }}>
                {level.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ margin: 0, fontWeight: '700', color: '#1E293B', fontSize: '16px' }}>
                    {leader.name || 'Anonymous User'}
                    {isCurrentUser && (
                      <span style={{ marginLeft: '8px', background: '#0D9488', color: '#FFFFFF', fontSize: '11px', padding: '3px 8px', borderRadius: '10px' }}>YOU</span>
                    )}
                  </p>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
                  {level.name} · 🔥 {leader.studyStreak || 0} streak · 📝 {leader.testsCount || 0} tests
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontWeight: '800', fontSize: '20px', color: '#FBBF24' }}>
                  {(leader.totalXP || 0).toLocaleString()}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>XP</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
