import { useState, useEffect } from "react";
import { Search, BookOpen, XCircle, RefreshCw, Filter, Brain } from "lucide-react";
import { loadDashboardData } from "../../firebase";
import ChatBot from "../../components/ChatBot";

export default function MistakeJournal({ user, profile, onBack, onStartTest }) {
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [conceptFilter, setConceptFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      loadDashboardData(user.uid).then(data => {
        setJournal(data.mistakes || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>📓</div>
          <p style={{ color: '#0D9488', fontWeight: '600', fontSize: '16px' }}>Loading your mistake journal...</p>
        </div>
      </div>
    );
  }

  // Normalise field names: Firestore stores correctAnswer / wrongAnswer
  const normalised = journal.map(item => ({
    ...item,
    correct: item.correctAnswer || item.correct || '',
    userAnswer: item.wrongAnswer || item.userAnswer || '',
  }));

  const subjects = ["All", ...new Set(normalised.map(j => j.subject).filter(Boolean))];
  const concepts = ["All", ...new Set(normalised.map(j => j.concept).filter(Boolean))];

  const filtered = normalised.filter(j => {
    const matchSubject = subjectFilter === "All" || j.subject === subjectFilter;
    const matchConcept = conceptFilter === "All" || j.concept === conceptFilter;
    const matchSearch = !search || j.question?.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchConcept && matchSearch;
  });

  // Group by concept
  const grouped = {};
  filtered.forEach(item => {
    const key = item.concept || 'General';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  return (
    <div style={{ minHeight: '100vh', padding: '32px 16px', background: '#F8FAFC' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', padding: 0 }}>
            ← Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ color: '#0D1B4B', fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0' }}>
                📓 Mistake Journal
              </h1>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                {journal.length} mistakes logged · Review & improve
              </p>
            </div>

            {/* Summary badges */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { label: 'Total', value: journal.length, color: '#EF4444', bg: '#FEF2F2' },
                { label: 'Concepts', value: concepts.length - 1, color: '#6366f1', bg: '#EEF2FF' },
                { label: 'Subjects', value: subjects.length - 1, color: '#0D9488', bg: '#F0FDFA' },
              ].map(badge => (
                <div key={badge.label} style={{ background: badge.bg, borderRadius: '10px', padding: '8px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: badge.color }}>{badge.value}</div>
                  <div style={{ fontSize: '11px', color: badge.color, fontWeight: '600' }}>{badge.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ background: '#FFF', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions..."
              style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '14px', outline: 'none', background: '#F8FAFC' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={14} color="#64748B" />
            <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} style={{ borderRadius: '10px', border: '1.5px solid #E2E8F0', padding: '10px 12px', fontSize: '13px', outline: 'none', background: '#FFF', cursor: 'pointer', color: '#1E293B' }}>
              {subjects.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={conceptFilter} onChange={e => setConceptFilter(e.target.value)} style={{ borderRadius: '10px', border: '1.5px solid #E2E8F0', padding: '10px 12px', fontSize: '13px', outline: 'none', background: '#FFF', cursor: 'pointer', color: '#1E293B' }}>
              {concepts.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Empty State */}
        {journal.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: '#FFF', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <BookOpen size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: '#1E293B', fontWeight: '700', fontSize: '20px', margin: '0 0 8px 0' }}>No mistakes yet — great job! 🎉</h3>
            <p style={{ color: '#64748B', fontSize: '14px', margin: '0 0 24px 0' }}>Take a test to start tracking wrong answers here.</p>
          </div>
        )}

        {filtered.length === 0 && journal.length > 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94A3B8', background: '#FFF', borderRadius: '16px' }}>
            <Search size={32} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: '500', margin: 0 }}>No matches found for your filters</p>
          </div>
        )}

        {/* Grouped by concept */}
        {Object.entries(grouped).map(([concept, items]) => (
          <div key={concept} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#FEF2F2', color: '#EF4444', borderRadius: '8px', padding: '4px 12px', fontSize: '13px', fontWeight: '700' }}>
                  {concept}
                </div>
                <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500' }}>{items.length} mistake{items.length !== 1 ? 's' : ''}</span>
              </div>

              {onStartTest && (
                <button
                  onClick={() => onStartTest(concept)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', background: 'linear-gradient(135deg,#0D9488,#14B8A6)', color: '#FFF', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                >
                  <Brain size={13} color="#FFF" />
                  Practice Again
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map((item, i) => {
                const key = item.id || `${concept}-${i}`;
                const isExpanded = expandedId === key;
                return (
                  <div key={key} style={{
                    background: '#FFF', borderRadius: '14px', padding: '18px 20px',
                    border: '1.5px solid #FEE2E2',
                    boxShadow: '0 2px 8px rgba(239,68,68,0.06)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                    onClick={() => setExpandedId(isExpanded ? null : key)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: isExpanded ? '16px' : 0 }}>
                      <XCircle size={16} color="#F87171" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B', margin: '0 0 4px 0', lineHeight: '1.5' }}>
                          {item.question}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {item.subject && (
                            <span style={{ fontSize: '11px', background: '#F0FDFA', color: '#0D9488', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                              {item.subject}
                            </span>
                          )}
                          <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#64748B', padding: '2px 8px', borderRadius: '12px' }}>
                            {item.date?.toDate ? item.date.toDate().toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                      </div>
                      <span style={{ color: '#CBD5E1', fontSize: '18px', flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                    </div>

                    {isExpanded && (
                      <div style={{ marginLeft: '26px', display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fadeIn 0.2s' }}>
                        {/* Options */}
                        {item.options && Object.entries(item.options).map(([k, v]) => {
                          const isCorrect = k === item.correct;
                          const isWrong = k === item.userAnswer && k !== item.correct;
                          return (
                            <div key={k} style={{
                              padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
                              background: isCorrect ? '#F0FDF4' : isWrong ? '#FEF2F2' : '#F8FAFC',
                              border: `1px solid ${isCorrect ? '#BBF7D0' : isWrong ? '#FECACA' : '#E2E8F0'}`,
                              color: isCorrect ? '#15803D' : isWrong ? '#DC2626' : '#475569',
                              fontWeight: (isCorrect || isWrong) ? '600' : '400'
                            }}>
                              <span style={{ fontWeight: '700', marginRight: '8px' }}>{k}.</span>
                              {v}
                              {isCorrect && <span style={{ marginLeft: '8px' }}>✓ Correct</span>}
                              {isWrong && <span style={{ marginLeft: '8px' }}>✗ Your answer</span>}
                            </div>
                          );
                        })}

                        {/* Explanation */}
                        {item.explanation && (
                          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#166534', marginTop: '4px' }}>
                            🧠 <strong>Explanation:</strong> {item.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Refresh Button */}
        {journal.length > 0 && (
          <div style={{ textAlign: 'center', paddingTop: '8px', paddingBottom: '32px' }}>
            <button
              onClick={() => {
                setLoading(true);
                loadDashboardData(user.uid).then(data => { setJournal(data.mistakes || []); setLoading(false); });
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: '#FFF', color: '#64748B', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
            >
              <RefreshCw size={14} color="#64748B" />
              Refresh Journal
            </button>
          </div>
        )}
      </div>
      <ChatBot profile={profile} user={user} />
    </div>
  );
}
