import { useState, useEffect } from "react";
import { BookOpen, Trophy, TrendingUp, Target } from "lucide-react";
import { StatCard } from "../../components/UI";
import ChatBot from "../../components/ChatBot";
import { joinClass, loadDashboardData } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function StudentHome({ user, onTakeTest, profile }) {
  const [classCodeInput, setClassCodeInput] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadDashboardData(user.uid).then(data => {
        setTests(data.tests || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user]);

  const handleJoinClass = async () => {
    if (!classCodeInput.trim()) return;
    setJoining(true);
    setJoinError('');
    try {
      const classData = await joinClass(classCodeInput.trim(), user.uid, profile?.name || 'Student');
      await updateDoc(doc(db, 'users', user.uid), {
        classId: classData.id,
        classCode: classData.classCode,
        className: classData.className,
      });
      setJoinSuccess(true);
      // Reload after 1.5s
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setJoinError(err.message);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px', animation: 'spin 2s linear infinite' }}>🎓</div>
          <p style={{ color: '#7c3aed', fontWeight: '600', fontSize: '16px', margin: 0 }}>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const hasClass = !!profile?.classId;
  const bestScore = tests.length ? Math.max(...tests.map(t => t.percentage || 0)) : 0;
  const avgScore = tests.length ? Math.round(tests.reduce((s, t) => s + (t.percentage || 0), 0) / tests.length) : 0;

  const chartData = [...tests].reverse().slice(-10).map(t => ({
    date: t.date?.toDate ? t.date.toDate().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'N/A',
    score: t.percentage || 0,
  }));

  return (
    <div style={{ minHeight: '100vh', padding: '32px 16px', background: '#F8FAFC' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>

        {/* Hero Header */}
        <div style={{ borderRadius: '24px', padding: '28px', color: '#FFF', marginBottom: '24px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#6366f1,#7c3aed)', boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', borderRadius: '50%', opacity: 0.08, background: 'white', transform: 'translate(60px, -60px)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '40%', width: '120px', height: '120px', borderRadius: '50%', opacity: 0.06, background: 'white', transform: 'translateY(50px)' }} />

          <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0' }}>
            Welcome back, {profile?.name || 'Student'}! 👋
          </h1>

          {hasClass ? (
            <p style={{ color: '#E9D5FF', fontSize: '13px', margin: '0 0 16px 0' }}>
              Class: <strong>{profile.className}</strong> · Code:
              <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '15px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '8px', marginLeft: '6px' }}>
                {profile.classCode}
              </span>
            </p>
          ) : (
            <p style={{ color: '#E9D5FF', fontSize: '13px', margin: '0 0 16px 0' }}>Join a class to access tests from your teacher</p>
          )}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '600' }}>
              Board: {profile?.board || 'General'}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '600' }}>
              Grade: {profile?.grade || 'N/A'}
            </span>
          </div>
        </div>

        {/* Join Class */}
        {!hasClass && (
          <div style={{ background: '#FFF', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: '24px', border: '1.5px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#1E293B', fontSize: '18px', fontWeight: '700' }}>🔑 Join a Class</h3>
            <p style={{ color: '#64748B', fontSize: '14px', margin: '0 0 18px 0' }}>Enter the 6-character code your teacher gave you</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="e.g. A1B2C3"
                value={classCodeInput}
                onChange={e => setClassCodeInput(e.target.value.toUpperCase())}
                maxLength={6}
                style={{ flex: 1, padding: '13px 16px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '18px', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '4px', textTransform: 'uppercase', outline: 'none', textAlign: 'center' }}
              />
              <button
                onClick={handleJoinClass}
                disabled={joining || !classCodeInput.trim() || joinSuccess}
                style={{ padding: '13px 24px', borderRadius: '10px', background: joinSuccess ? '#10B981' : 'linear-gradient(135deg,#7c3aed,#6366f1)', color: '#FFF', border: 'none', fontWeight: '700', cursor: joining ? 'not-allowed' : 'pointer', fontSize: '14px', minWidth: '110px' }}
              >
                {joinSuccess ? '✓ Joined!' : joining ? 'Joining...' : 'Join Class'}
              </button>
            </div>
            {joinError && <p style={{ color: '#EF4444', fontSize: '13px', margin: '10px 0 0 0', fontWeight: '500' }}>⚠️ {joinError}</p>}
          </div>
        )}

        {/* Stats */}
        {hasClass && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <StatCard icon={<BookOpen size={18} color="#FFF" />} label="Tests Taken" value={tests.length} color="#6366f1" />
            <StatCard icon={<Trophy size={18} color="#FFF" />} label="Best Score" value={`${bestScore}%`} color="#10B981" />
            <StatCard icon={<TrendingUp size={18} color="#FFF" />} label="Average" value={`${avgScore}%`} color="#F59E0B" />
          </div>
        )}

        {/* Take Test CTA */}
        {hasClass && (
          <div style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)', borderRadius: '20px', padding: '28px', marginBottom: '24px', boxShadow: '0 6px 20px rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ color: '#FFF', margin: '0 0 6px 0', fontSize: '18px', fontWeight: '700' }}>📝 Class Assessment</h3>
              <p style={{ color: '#E9D5FF', margin: 0, fontSize: '14px' }}>{profile.className} · Available Now</p>
            </div>
            <button onClick={onTakeTest} style={{ padding: '14px 28px', borderRadius: '12px', background: '#FFF', color: '#7c3aed', fontWeight: '800', fontSize: '15px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              Start Test ▶
            </button>
          </div>
        )}

        {/* Progress Chart */}
        {chartData.length > 1 && (
          <div style={{ background: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: '24px', border: '1px solid #F1F5F9' }}>
            <h3 style={{ margin: '0 0 18px 0', color: '#0D1B4B', fontSize: '17px', fontWeight: '700' }}>📈 Your Progress</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '13px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} formatter={v => [`${v}%`, 'Score']} />
                  <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4, fill: '#7c3aed', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Past Results */}
        {tests.length > 0 && (
          <div style={{ background: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9' }}>
            <h3 style={{ margin: '0 0 18px 0', color: '#0D1B4B', fontSize: '17px', fontWeight: '700' }}>📋 Past Results</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tests.slice(0, 8).map((r, i) => {
                const pct = r.percentage || 0;
                return (
                  <div key={r.id || i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFF', fontSize: '13px', fontWeight: '800', flexShrink: 0,
                      background: pct >= 75 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444'
                    }}>
                      {pct}%
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600', color: '#1E293B', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.subject} {r.topic ? `— ${r.topic}` : ''}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                        {r.examType} · {r.date?.toDate ? r.date.toDate().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recent'}
                      </div>
                    </div>
                    <div style={{ fontWeight: '700', color: '#475569', fontSize: '14px', flexShrink: 0 }}>
                      {r.score}/{r.total}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {hasClass && tests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: '#FFF', borderRadius: '20px', border: '1.5px dashed #E2E8F0', color: '#64748B' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📝</div>
            <p style={{ fontWeight: '600', color: '#1E293B', fontSize: '16px', margin: '0 0 8px 0' }}>No tests taken yet</p>
            <p style={{ fontSize: '14px', margin: 0 }}>Click "Start Test" above to take your first assessment!</p>
          </div>
        )}

        {/* No Class Empty State */}
        {!hasClass && tests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: '#FFF', borderRadius: '20px', border: '1.5px dashed #E2E8F0', color: '#64748B' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏫</div>
            <p style={{ fontWeight: '600', color: '#1E293B', fontSize: '16px', margin: '0 0 8px 0' }}>Join a class to get started</p>
            <p style={{ fontSize: '14px', margin: 0 }}>Ask your teacher for the class code and enter it above.</p>
          </div>
        )}

      </div>
      <ChatBot profile={profile} user={user} />
    </div>
  );
}
