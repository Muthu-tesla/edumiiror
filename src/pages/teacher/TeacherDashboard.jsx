import { useState, useEffect } from "react";
import { Plus, Copy, Users, BookOpen, BarChart2, ArrowLeft, TrendingUp, AlertTriangle, Award } from "lucide-react";
import { StatCard } from "../../components/UI";
import { toast } from "../../components/Toast";
import ChatBot from "../../components/ChatBot";
import { getTeacherClasses, createClass, getClassResults } from "../../firebase";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function TeacherDashboard({ user, profile, onCreateTest }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassSubject, setNewClassSubject] = useState("");

  const [selectedClass, setSelectedClass] = useState(null);
  const [classResults, setClassResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      getTeacherClasses(user.uid).then(data => {
        setClasses(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user]);

  const handleCreateClass = async () => {
    if (!newClassName.trim() || !newClassSubject.trim()) {
      toast.error("Please fill class name and subject");
      return;
    }
    try {
      const { id, code } = await createClass(user.uid, { name: newClassName, subject: newClassSubject });
      toast.success("Class created! Code: " + code);
      setClasses([{ id, className: newClassName, subject: newClassSubject, classCode: code, students: [], testsCount: 0 }, ...classes]);
      setShowAddClass(false);
      setNewClassName("");
      setNewClassSubject("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => toast.success(`Code ${code} copied!`));
  };

  const loadAnalytics = async (cls) => {
    setSelectedClass(cls);
    setLoadingResults(true);
    try {
      const results = await getClassResults(cls.id);
      setClassResults(results);
    } catch (err) {
      console.error(err);
      setClassResults([]);
    }
    setLoadingResults(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px', animation: 'spin 2s linear infinite' }}>🏫</div>
        <p style={{ color: '#0D9488', fontWeight: '600', fontSize: '16px' }}>Loading Dashboard...</p>
      </div>
    );
  }

  /* ──────────────────────────────────────────
     CLASS ANALYTICS VIEW
  ────────────────────────────────────────── */
  if (selectedClass) {
    // Build per-student stats
    const studentStats = {};
    classResults.forEach(r => {
      const sid = r.userId || 'unknown';
      if (!studentStats[sid]) {
        studentStats[sid] = { name: r.studentName || sid.substring(0, 8) + '...', tests: [], conceptScores: {} };
      }
      studentStats[sid].tests.push({ pct: r.percentage || 0, date: r.date });

      // Aggregate concept scores
      if (r.conceptScores) {
        Object.entries(r.conceptScores).forEach(([con, data]) => {
          if (!studentStats[sid].conceptScores[con]) studentStats[sid].conceptScores[con] = { correct: 0, total: 0 };
          studentStats[sid].conceptScores[con].correct += data.correct || 0;
          studentStats[sid].conceptScores[con].total += data.total || 0;
        });
      }
    });

    // Chart: class average per test date
    const chartData = classResults
      .slice().sort((a, b) => (a.date?.seconds || 0) - (b.date?.seconds || 0))
      .map(r => ({
        date: r.date?.toDate ? r.date.toDate().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'N/A',
        avg: r.percentage || 0
      }));

    const allConcepts = [...new Set(classResults.flatMap(r => Object.keys(r.conceptScores || {})))];
    const studentList = Object.entries(studentStats);

    const needsAttention = studentList.filter(([sid, stat]) => {
      const avg = stat.tests.length ? stat.tests.reduce((s, t) => s + t.pct, 0) / stat.tests.length : 0;
      return avg < 50;
    });

    const classAvg = classResults.length
      ? Math.round(classResults.reduce((s, r) => s + (r.percentage || 0), 0) / classResults.length)
      : 0;

    return (
      <div style={{ padding: '32px 16px', background: '#F8FAFC', minHeight: '100vh' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <button onClick={() => setSelectedClass(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: '#FFF', cursor: 'pointer', marginBottom: '24px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>
            <ArrowLeft size={15} /> Back to Dashboard
          </button>

          <div style={{ background: 'linear-gradient(135deg,#0D1B4B,#1e3a8a)', borderRadius: '20px', padding: '24px', color: '#FFF', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0' }}>📊 {selectedClass.className}</h2>
            <p style={{ color: '#94A3B8', margin: '0 0 16px 0', fontSize: '13px' }}>Subject: {selectedClass.subject} · Code: <strong style={{ fontFamily: 'monospace', color: '#5EEAD4' }}>{selectedClass.classCode}</strong></p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { label: 'Students', value: selectedClass.students?.length || 0, color: '#5EEAD4' },
                { label: 'Tests', value: classResults.length, color: '#60a5fa' },
                { label: 'Class Avg', value: `${classAvg}%`, color: classAvg >= 70 ? '#34D399' : classAvg >= 50 ? '#FBBF24' : '#F87171' },
                { label: 'Need Attention', value: needsAttention.length, color: '#F87171' },
              ].map(stat => (
                <div key={stat.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: '12px', color: '#CBD5E1' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {loadingResults ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#0D9488', fontWeight: '600' }}>Loading results...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Class performance over time */}
              {chartData.length > 0 && (
                <div style={{ background: '#FFF', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#0D1B4B', fontWeight: '700', fontSize: '16px' }}>📈 Class Performance Over Time</h3>
                  <div style={{ height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                        <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '13px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} formatter={v => [`${v}%`, 'Avg Score']} />
                        <Line type="monotone" dataKey="avg" stroke="#0D9488" strokeWidth={3} dot={{ r: 4, fill: '#0D9488', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Students needing attention */}
              {needsAttention.length > 0 && (
                <div style={{ background: '#FFF', borderRadius: '16px', padding: '24px', border: '1.5px solid #FECACA', boxShadow: '0 2px 8px rgba(239,68,68,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <AlertTriangle size={18} color="#EF4444" />
                    <h3 style={{ margin: 0, color: '#1E293B', fontWeight: '700', fontSize: '16px' }}>Students Needing Attention</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {needsAttention.map(([sid, stat]) => {
                      const avg = Math.round(stat.tests.reduce((s, t) => s + t.pct, 0) / stat.tests.length);
                      return (
                        <div key={sid} style={{ background: '#FEF2F2', borderRadius: '10px', padding: '14px', border: '1px solid #FECACA' }}>
                          <div style={{ fontWeight: '600', color: '#1E293B', fontSize: '14px', marginBottom: '4px' }}>{stat.name}</div>
                          <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: '700' }}>Avg: {avg}%</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{stat.tests.length} test{stat.tests.length !== 1 ? 's' : ''} taken</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Student Performance Table */}
              <div style={{ background: '#FFF', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#1E293B', fontWeight: '700', fontSize: '16px' }}>👥 Student Performance</h3>
                {studentList.length === 0 ? (
                  <p style={{ color: '#64748B', textAlign: 'center', padding: '24px', margin: 0 }}>No tests taken yet in this class.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ background: '#F8FAFC' }}>
                          {['Student', 'Tests Taken', 'Avg Score', 'Best Score', 'Trend'].map(h => (
                            <th key={h} style={{ padding: '12px 14px', borderBottom: '2px solid #E2E8F0', color: '#475569', fontWeight: '600', textAlign: 'left', fontSize: '13px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {studentList.map(([sid, stat], i) => {
                          const avg = Math.round(stat.tests.reduce((s, t) => s + t.pct, 0) / stat.tests.length);
                          const best = Math.max(...stat.tests.map(t => t.pct));
                          const trend = stat.tests.length > 1
                            ? stat.tests[stat.tests.length - 1].pct > stat.tests[0].pct ? '↑' : stat.tests[stat.tests.length - 1].pct < stat.tests[0].pct ? '↓' : '→'
                            : '—';
                          const trendColor = trend === '↑' ? '#10B981' : trend === '↓' ? '#EF4444' : '#94A3B8';
                          return (
                            <tr key={sid} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#FFF' : '#F8FAFC' }}>
                              <td style={{ padding: '12px 14px', color: '#1E293B', fontWeight: '500' }}>{stat.name}</td>
                              <td style={{ padding: '12px 14px', color: '#475569' }}>{stat.tests.length}</td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{ fontWeight: '700', color: avg >= 70 ? '#10B981' : avg >= 50 ? '#F59E0B' : '#EF4444' }}>{avg}%</span>
                              </td>
                              <td style={{ padding: '12px 14px', color: '#10B981', fontWeight: '600' }}>{best}%</td>
                              <td style={{ padding: '12px 14px', fontWeight: '700', fontSize: '16px', color: trendColor }}>{trend}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Concept Heatmap */}
              {allConcepts.length > 0 && studentList.length > 0 && (
                <div style={{ background: '#FFF', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#1E293B', fontWeight: '700', fontSize: '16px' }}>🗺️ Concept Weakness Heatmap</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', fontSize: '12px', minWidth: '100%' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '8px 12px', borderBottom: '2px solid #E2E8F0', color: '#475569', textAlign: 'left', fontWeight: '600' }}>Student</th>
                          {allConcepts.map(c => (
                            <th key={c} style={{ padding: '8px 10px', borderBottom: '2px solid #E2E8F0', color: '#475569', fontWeight: '600', whiteSpace: 'nowrap', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {c.length > 12 ? c.substring(0, 12) + '…' : c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {studentList.map(([sid, stat]) => (
                          <tr key={sid}>
                            <td style={{ padding: '8px 12px', color: '#1E293B', fontWeight: '500', whiteSpace: 'nowrap' }}>{stat.name}</td>
                            {allConcepts.map(con => {
                              const data = stat.conceptScores[con];
                              const pct = data && data.total > 0 ? Math.round((data.correct / data.total) * 100) : null;
                              const bg = pct === null ? '#F1F5F9' : pct >= 70 ? '#BBF7D0' : pct >= 40 ? '#FEF3C7' : '#FECACA';
                              const color = pct === null ? '#CBD5E1' : pct >= 70 ? '#15803D' : pct >= 40 ? '#92400E' : '#991B1B';
                              return (
                                <td key={con} style={{ padding: '8px 10px', textAlign: 'center' }}>
                                  <div style={{ background: bg, color, fontWeight: '700', fontSize: '12px', borderRadius: '6px', padding: '4px 6px', minWidth: '36px' }}>
                                    {pct !== null ? `${pct}%` : '—'}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {[{ color: '#BBF7D0', label: '≥70% (Strong)', text: '#15803D' }, { color: '#FEF3C7', label: '40-69% (Moderate)', text: '#92400E' }, { color: '#FECACA', label: '<40% (Weak)', text: '#991B1B' }, { color: '#F1F5F9', label: 'No data', text: '#CBD5E1' }].map(({ color, label, text }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: text, fontWeight: '600' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: color }} />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────
     MAIN DASHBOARD VIEW
  ────────────────────────────────────────── */
  const totalStudents = classes.reduce((sum, c) => sum + (c.students?.length || 0), 0);
  const totalTests = classes.reduce((sum, c) => sum + (c.testsCount || 0), 0);

  return (
    <div style={{ padding: '32px 16px', background: '#F8FAFC', minHeight: '100vh' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header card */}
        <div style={{ borderRadius: '24px', padding: '28px', color: '#FFF', marginBottom: '24px', background: 'linear-gradient(135deg,#0D1B4B,#1e3a8a)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 8px 32px rgba(13,27,75,0.25)' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0' }}>Welcome back, {profile?.name || 'Teacher'}! 👩‍🏫</h1>
            <p style={{ color: '#CBD5E1', fontSize: '13px', margin: 0 }}>Manage classes, create tests, and view AI insights at <strong style={{ color: '#5EEAD4' }}>{profile?.schoolName || 'your institute'}</strong></p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', padding: '12px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', color: '#5EEAD4' }}>
            🏫 {profile?.schoolName || 'Educator'}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <StatCard icon={<BookOpen size={20} color="#FFF" />} label="Classes" value={classes.length} color="#0D1B4B" />
          <StatCard icon={<Users size={20} color="#FFF" />} label="Students" value={totalStudents} color="#0D9488" />
          <StatCard icon={<BarChart2 size={20} color="#FFF" />} label="Tests Given" value={totalTests} color="#6366f1" />
          <StatCard icon={<Award size={20} color="#FFF" />} label="Avg Engagement" value={totalStudents > 0 ? `${Math.min(100, Math.round((totalTests / Math.max(1, totalStudents)) * 10 + 50))}%` : '—'} color="#F59E0B" />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setShowAddClass(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', borderRadius: '12px', color: '#FFF', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#0D1B4B,#1e3a8a)', boxShadow: '0 4px 14px rgba(13,27,75,0.3)' }}>
            <Plus size={16} color="#FFF" /> Create Class
          </button>
          <button onClick={onCreateTest} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', borderRadius: '12px', color: '#FFF', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#0D9488,#14B8A6)', boxShadow: '0 4px 14px rgba(13,148,136,0.3)' }}>
            <BookOpen size={16} color="#FFF" /> Create Test for Class
          </button>
        </div>

        {/* Create Class Form */}
        {showAddClass && (
          <div style={{ background: '#FFF', padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', animation: 'fadeIn 0.2s' }}>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '6px', fontWeight: '700' }}>Class Name</label>
              <input value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="e.g. Grade 10 Physics" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '6px', fontWeight: '700' }}>Subject</label>
              <input value={newClassSubject} onChange={e => setNewClassSubject(e.target.value)} placeholder="e.g. Physics" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleCreateClass} style={{ padding: '11px 22px', background: '#0D9488', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Create</button>
            <button onClick={() => setShowAddClass(false)} style={{ padding: '11px 22px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
          </div>
        )}

        {/* Classes Grid */}
        <h3 style={{ fontWeight: '700', color: '#1E293B', marginBottom: '16px', fontSize: '18px' }}>My Classes</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {classes.map(cls => (
            <div key={cls.id} style={{ background: '#FFF', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1.5px solid #F1F5F9', transition: 'box-shadow 0.2s' }}
              onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'}
              onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.07)'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '16px' }}>{cls.className}</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{cls.subject}</div>
                </div>
                <button onClick={() => loadAnalytics(cls)} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: '#FFF', background: 'linear-gradient(135deg,#0D9488,#14B8A6)', border: 'none', cursor: 'pointer' }}>
                  Analytics
                </button>
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                <span>👥 {cls.students?.length || 0} students</span>
                <span>📝 {cls.testsCount || 0} tests</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', borderRadius: '10px', padding: '12px 14px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '2px' }}>Class Code</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '20px', letterSpacing: '3px', color: '#0D1B4B' }}>{cls.classCode}</div>
                </div>
                <button onClick={() => copyCode(cls.classCode)} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0D9488', fontSize: '13px', fontWeight: '600', background: '#F0FDFA', border: '1px solid #CCFBF1', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                  <Copy size={13} color="#0D9488" /> Copy
                </button>
              </div>
            </div>
          ))}

          {classes.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '60px 24px', textAlign: 'center', background: '#FFF', borderRadius: '16px', color: '#64748B', border: '1.5px dashed #E2E8F0' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏫</div>
              <p style={{ fontWeight: '600', fontSize: '16px', color: '#1E293B', margin: '0 0 8px 0' }}>No classes yet</p>
              <p style={{ fontSize: '14px', margin: 0 }}>Click "Create Class" to get started and share the code with your students.</p>
            </div>
          )}
        </div>
      </div>
      <ChatBot profile={profile} user={user} />
    </div>
  );
}
