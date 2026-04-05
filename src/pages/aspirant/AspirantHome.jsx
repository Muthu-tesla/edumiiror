import { useState, useEffect } from "react";
import { BookOpen, Target, FileText, Map, Clock, AlertTriangle, TrendingUp, Lightbulb, Flame, Star, Award } from "lucide-react";
import { StatCard } from "../../components/UI";
import ChatBot from "../../components/ChatBot";
import { getUserProfile, getUserTests, getUserMistakes } from "../../firebase";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { generateDailyChallenges } from "../../utils/gamification";

// ── Achievement badge definitions ──────────────────────────────────────────
const ACHIEVEMENTS = [
  {
    id: 'first_test',
    icon: '🏆',
    title: 'First Step',
    desc: 'Completed your first test',
    check: ({ tests }) => tests.length >= 1,
    color: '#F59E0B',
    bg: '#FFFBEB',
  },
  {
    id: 'five_tests',
    icon: '📚',
    title: 'Scholar',
    desc: 'Completed 5 tests',
    check: ({ tests }) => tests.length >= 5,
    color: '#6366f1',
    bg: '#EEF2FF',
  },
  {
    id: 'ten_tests',
    icon: '🎓',
    title: 'Pro Learner',
    desc: 'Completed 10 tests',
    check: ({ tests }) => tests.length >= 10,
    color: '#0D9488',
    bg: '#F0FDFA',
  },
  {
    id: 'high_score',
    icon: '⭐',
    title: 'Star Performer',
    desc: 'Scored 90%+ in a test',
    check: ({ tests }) => tests.some(t => t.percentage >= 90),
    color: '#EF4444',
    bg: '#FEF2F2',
  },
  {
    id: 'perfect',
    icon: '💯',
    title: 'Perfectionist',
    desc: 'Got 0 mistakes in a test',
    check: ({ tests }) => tests.some(t => t.score === t.total && t.total > 0),
    color: '#10B981',
    bg: '#F0FDF4',
  },
  {
    id: 'streak_5',
    icon: '🔥',
    title: 'On Fire',
    desc: '5-day study streak',
    check: ({ streak }) => streak >= 5,
    color: '#F97316',
    bg: '#FFF7ED',
  },
  {
    id: 'streak_10',
    icon: '🚀',
    title: 'Unstoppable',
    desc: '10-day study streak',
    check: ({ streak }) => streak >= 10,
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },
];

export default function AspirantHome({ user, onStartTest, onJournal, onStudyPlan, profile, onDashboardData }) {
  const [tests, setTests] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    testsCount: 0,
    avgScore: 0,
    studyStreak: 0,
    weakAreas: 0
  });

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const freshProfile = await getUserProfile(user.uid);
      const userTests = await getUserTests(user.uid);
      const userMistakes = await getUserMistakes(user.uid);

      setTests(userTests);
      setMistakes(userMistakes);

      const conceptFailures = {};
      userTests.forEach(test => {
        (test.weakConcepts || []).forEach(concept => {
          conceptFailures[concept] = (conceptFailures[concept] || 0) + 1;
        });
      });
      const weakAreaCount = Object.keys(conceptFailures).length;

      setStats({
        testsCount: freshProfile?.testsCount || 0,
        avgScore: freshProfile?.avgScore || 0,
        studyStreak: freshProfile?.studyStreak || 0,
        weakAreas: weakAreaCount
      });
      
      if (onDashboardData) onDashboardData({ tests: userTests, mistakes: userMistakes, profile: freshProfile });
    } catch (err) {
      console.error('loadData error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px', animation: 'spin 2s linear infinite' }}>📚</div>
          <p style={{ color: '#0D9488', fontWeight: '600', fontSize: '16px', margin: 0 }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const testsCount = tests.length;
  const avgScore = testsCount > 0 ? Math.round(tests.reduce((s, t) => s + (t.percentage || 0), 0) / testsCount) : (profile?.avgScore || 0);
  const streak = profile?.studyStreak || 0;
  const weakConcepts = [...new Set(mistakes.map(m => m.concept).filter(Boolean))];

  const actions = [
    { icon: <BookOpen size={22} color="#FFFFFF" />, label: "Start New Test", desc: "Generate AI questions", color: "#0D9488", fn: onStartTest },
    { icon: <FileText size={22} color="#FFFFFF" />, label: "Mistake Journal", desc: `${mistakes.length} mistake${mistakes.length !== 1 ? 's' : ''} logged`, color: "#EF4444", fn: onJournal },
    { icon: <Map size={22} color="#FFFFFF" />, label: "Study Plan", desc: "AI-generated roadmap", color: "#6366f1", fn: onStudyPlan },
  ];

  let daysLeft = 0;
  if (profile?.examDate) {
    daysLeft = Math.max(0, Math.ceil((new Date(profile.examDate) - new Date()) / (1000 * 3600 * 24)));
  }

  const focusSubject = weakConcepts[0] || profile?.weakSubjects?.[0] || "Physics";

  // Recharts data (last 10 tests)
  const chartData = [...tests].reverse().slice(-10).map(t => ({
    date: t.date?.toDate ? t.date.toDate().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'N/A',
    score: t.percentage || 0,
    subject: t.subject,
  }));

  // Subject-wise breakdown
  const subjectStats = {};
  tests.forEach(t => {
    if (!t.subject) return;
    if (!subjectStats[t.subject]) subjectStats[t.subject] = { scores: [], count: 0 };
    subjectStats[t.subject].scores.push(t.percentage || 0);
    subjectStats[t.subject].count++;
  });

  // Achievements
  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.check({ tests, mistakes, streak }));

  const challenges = generateDailyChallenges(profile);
  const completedChallenges = profile?.completedChallenges || [];

  const getTimeUntilMidnight = () => {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - new Date();
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m`;
  };

  const StreakWidget = ({ currentStreak }) => (
    <div style={{
      background: currentStreak > 0 
        ? 'linear-gradient(135deg, #FF6B35, #F7C59F)'
        : '#F1F5F9',
      borderRadius: '24px',
      padding: '24px',
      textAlign: 'center',
      border: currentStreak > 0 ? 'none' : '1px solid #E2E8F0',
      boxShadow: currentStreak > 0 ? '0 8px 24px rgba(255,107,53,0.3)' : 'none'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '8px' }}>
        {currentStreak > 0 ? '🔥' : '💤'}
      </div>
      <p style={{
        fontSize: '40px', fontWeight: '900',
        color: currentStreak > 0 ? '#FFFFFF' : '#94A3B8', margin: '0 0 4px'
      }}>
        {currentStreak}
      </p>
      <p style={{
        fontSize: '14px', color: currentStreak > 0 ? 'rgba(255,255,255,0.9)' : '#94A3B8',
        fontWeight: '600', margin: 0
      }}>
        Day Streak
      </p>
      {currentStreak > 0 ? (
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', margin: '12px 0 0', fontWeight: '600' }}>
          🎯 Study today to keep it alive!
        </p>
      ) : (
        <p style={{ fontSize: '12px', color: '#94A3B8', margin: '12px 0 0', fontWeight: '600' }}>
          Start your streak today!
        </p>
      )}
    </div>
  );

  return (
    <div style={{ padding: '32px 16px', background: '#F8FAFC', minHeight: '100vh' }}>
      <div style={{ maxWidth: '920px', margin: '0 auto', width: '100%' }}>

        {/* ── Welcome Header ── */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px', borderRadius: '24px', padding: '28px', color: '#FFF', boxShadow: '0 8px 32px rgba(13,27,75,0.25)', background: 'linear-gradient(135deg,#0D1B4B 0%,#1e3a8a 60%,#0D9488 100%)' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0' }}>
              Welcome back, {profile?.name || 'Aspirant'}! 🎯
            </h1>
            <p style={{ color: '#CBD5E1', fontSize: '14px', margin: '0 0 20px 0' }}>
              Preparing for <strong style={{ color: '#5EEAD4' }}>{profile?.examType || 'JEE Main'}</strong>
            </p>

            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '700', color: '#5EEAD4', fontSize: '13px' }}>
                <Lightbulb size={16} /> AI Recommendations
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#CBD5E1' }}>
                <li>Focus on <strong style={{ color: '#FFF' }}>{focusSubject}</strong> — your weakest area</li>
                <li>At <strong style={{ color: '#FFF' }}>{profile?.level || 'Intermediate'}</strong> level, aim for 15 questions/day</li>
                <li>{profile?.studyHours ? `${profile.studyHours} study time → cover 2 topics daily` : 'Build a consistent study schedule'}</li>
              </ul>
            </div>
          </div>

          {/* Exam countdown card */}
          <div style={{ width: '220px', borderRadius: '24px', padding: '24px', background: '#FFF', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2E8F0' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg,#0D9488,#14B8A6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#FFF', fontSize: '22px', fontWeight: '800' }}>
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', marginBottom: '4px' }}>
              {profile?.examType || 'JEE Main'}
            </div>
            {daysLeft > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#0D9488', fontWeight: '700', background: '#F0FDFA', padding: '6px 12px', borderRadius: '16px', marginTop: '4px' }}>
                <Clock size={13} /> {daysLeft} days left
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#94A3B8' }}>Exam date not set</div>
            )}
            {streak > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#F97316', fontWeight: '700', background: '#FFF7ED', padding: '6px 12px', borderRadius: '16px', marginTop: '8px' }}>
                <Flame size={13} /> {streak} day streak
              </div>
            )}
            <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '12px', background: '#F1F5F9', color: '#475569' }}>
              Level: {profile?.level || 'Intermediate'}
            </div>
          </div>
          
          {/* Gamified Streak Widget */}
          <div style={{ width: '220px' }}>
            <StreakWidget currentStreak={streak} />
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <StatCard icon={<BookOpen size={20} color="#FFF" />} label="Tests Taken" value={testsCount} color="#0D9488" />
          <StatCard icon={<TrendingUp size={20} color="#FFF" />} label="Avg Score" value={`${avgScore}%`} color="#6366f1" />
          <StatCard icon={<Target size={20} color="#FFF" />} label="Streak" value={`${streak}d`} color="#F59E0B" />
          <StatCard icon={<AlertTriangle size={20} color="#FFF" />} label="Weak Areas" value={weakConcepts.length} color="#EF4444" />
        </div>

        {/* ── Daily Challenges ── */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: '24px', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#0D1B4B', fontWeight: '700', fontSize: '18px' }}>
              ⚔️ Today's Quests
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', background: '#F1F5F9', padding: '4px 12px', borderRadius: '12px' }}>
              Resets in {getTimeUntilMidnight()}
            </span>
          </div>

          {challenges.map(challenge => {
            const done = completedChallenges.includes(challenge.id);
            return (
              <div key={challenge.id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px', borderRadius: '16px',
                background: done ? '#F0FDF4' : '#F8FAFC',
                marginBottom: '12px', border: '1.5px solid',
                borderColor: done ? '#10B981' : '#E2E8F0',
                transition: 'all 0.2s'
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: done ? '#10B981' : '#E2E8F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', flexShrink: 0
                }}>
                  {done ? '✅' : challenge.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontWeight: '800', color: done ? '#10B981' : '#1E293B', fontSize: '15px', textDecoration: done ? 'line-through' : 'none' }}>
                    {challenge.title}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                    {challenge.desc}
                  </p>
                </div>
                <div style={{ background: done ? '#10B981' : '#0D9488', color: '#FFFFFF', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '800', whiteSpace: 'nowrap' }}>
                  +{challenge.xp} XP
                </div>
              </div>
            );
          })}
        </div>
        
        {/* ── Progress Chart ── */}
        {chartData.length > 0 && (
          <div style={{ background: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: '24px', border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ color: '#0D1B4B', margin: 0, fontSize: '18px', fontWeight: '700' }}>
                📈 Progress Trend
              </h3>
              <span style={{ fontSize: '12px', color: '#94A3B8', background: '#F1F5F9', padding: '4px 12px', borderRadius: '12px' }}>
                Last {chartData.length} test{chartData.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', fontSize: '13px' }}
                    formatter={(v) => [`${v}%`, 'Score']}
                  />
                  <Line type="monotone" dataKey="score" stroke="#0D9488" strokeWidth={3} dot={{ r: 4, fill: '#0D9488', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#0D1B4B' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Quick Actions ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {actions.map((a, i) => (
            <button key={i} onClick={a.fn} style={{
              background: '#FFF', borderRadius: '16px', padding: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              display: 'flex', alignItems: 'center', gap: '14px',
              border: '1.5px solid #F1F5F9', textAlign: 'left', cursor: 'pointer',
              width: '100%', transition: 'transform 0.15s, box-shadow 0.15s'
            }}
              onMouseOver={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `linear-gradient(135deg,${a.color}BB,${a.color})`, boxShadow: `0 4px 12px ${a.color}40` }}>
                {a.icon}
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '14px' }}>{a.label}</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{a.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* ── Subject Breakdown ── */}
        {Object.keys(subjectStats).length > 0 && (
          <div style={{ background: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: '24px', border: '1px solid #F1F5F9' }}>
            <h3 style={{ color: '#0D1B4B', margin: '0 0 18px 0', fontSize: '18px', fontWeight: '700' }}>📊 Subject Performance</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              {Object.entries(subjectStats).map(([sub, stat]) => {
                const subAvg = Math.round(stat.scores.reduce((a, b) => a + b, 0) / stat.scores.length);
                const trend = stat.scores.length > 1
                  ? stat.scores[stat.scores.length - 1] > stat.scores[0] ? '↑' : stat.scores[stat.scores.length - 1] < stat.scores[0] ? '↓' : '→'
                  : '';
                const trendColor = trend === '↑' ? '#10B981' : trend === '↓' ? '#EF4444' : '#94A3B8';
                return (
                  <div key={sub} style={{ border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '16px', background: '#F8FAFC' }}>
                    <div style={{ fontWeight: '600', color: '#1E293B', marginBottom: '8px', fontSize: '14px' }}>{sub}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '26px', fontWeight: '800', color: subAvg >= 75 ? '#10B981' : subAvg >= 50 ? '#F59E0B' : '#EF4444' }}>
                        {subAvg}%
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        {trend && <div style={{ fontSize: '16px', fontWeight: '700', color: trendColor }}>{trend}</div>}
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>{stat.count} test{stat.count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    {/* Mini progress bar */}
                    <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '2px', marginTop: '10px' }}>
                      <div style={{ height: '100%', width: `${subAvg}%`, borderRadius: '2px', background: subAvg >= 75 ? '#10B981' : subAvg >= 50 ? '#F59E0B' : '#EF4444', transition: 'width 0.8s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Achievements ── */}
        <div style={{ background: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: '24px', border: '1px solid #F1F5F9' }}>
          <h3 style={{ color: '#0D1B4B', margin: '0 0 18px 0', fontSize: '18px', fontWeight: '700' }}>
            🏅 Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {ACHIEVEMENTS.map(badge => {
              const unlocked = badge.check({ tests, mistakes, streak });
              return (
                <div key={badge.id} style={{
                  borderRadius: '14px', padding: '16px', textAlign: 'center',
                  background: unlocked ? badge.bg : '#F8FAFC',
                  border: `1.5px solid ${unlocked ? badge.color + '40' : '#E2E8F0'}`,
                  opacity: unlocked ? 1 : 0.45,
                  transition: 'all 0.2s'
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{badge.icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: unlocked ? badge.color : '#94A3B8', marginBottom: '4px' }}>
                    {badge.title}
                  </div>
                  <div style={{ fontSize: '11px', color: unlocked ? '#475569' : '#CBD5E1', lineHeight: '1.3' }}>
                    {badge.desc}
                  </div>
                  {unlocked && (
                    <div style={{ marginTop: '8px', fontSize: '10px', fontWeight: '700', color: badge.color, background: badge.bg, padding: '2px 8px', borderRadius: '12px', display: 'inline-block', border: `1px solid ${badge.color}30` }}>
                      ✓ Unlocked
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recent Tests ── */}
        {tests.length > 0 && (
          <div style={{ background: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: '24px', border: '1px solid #F1F5F9' }}>
            <h3 style={{ color: '#0D1B4B', margin: '0 0 18px 0', fontSize: '18px', fontWeight: '700' }}>📋 Recent Tests</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tests.slice(0, 5).map((t, i) => {
                const pct = t.percentage || 0;
                return (
                  <div key={t.id || i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '13px', fontWeight: '800', flexShrink: 0, background: pct >= 75 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444' }}>
                      {pct}%
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600', color: '#1E293B', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.subject} {t.topic ? `— ${t.topic}` : ''}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                        {t.examType} · {t.date?.toDate ? t.date.toDate().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recent'}
                      </div>
                    </div>
                    <div style={{ fontWeight: '700', color: '#475569', fontSize: '14px', flexShrink: 0 }}>
                      {t.score}/{t.total}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── No tests CTA ── */}
        {tests.length === 0 && (
          <div style={{ background: 'linear-gradient(135deg,#0D1B4B,#1e3a8a)', borderRadius: '20px', padding: '32px', textAlign: 'center', color: '#FFF', marginBottom: '24px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚀</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '700' }}>Ready to start your journey?</h3>
            <p style={{ color: '#CBD5E1', fontSize: '14px', margin: '0 0 20px 0' }}>Take your first AI-powered test and see your personalized analysis</p>
            <button onClick={onStartTest} style={{ padding: '14px 32px', borderRadius: '12px', border: 'none', background: '#0D9488', color: '#FFF', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(13,148,136,0.4)' }}>
              Start First Test ✨
            </button>
          </div>
        )}

      </div>

      <ChatBot profile={profile} user={user} />
    </div>
  );
}
