import { useState, useEffect } from "react";
import { PageHeader } from "../../components/UI";
import { toast } from "../../components/Toast";
import { generateQuestions } from "../../api/gpt4o";
import { EXAM_TYPES, SUBJECTS, DIFFICULTIES } from "../../data/mockData";
import SyllabusUploader from "../../components/SyllabusUploader";
import { getTeacherClasses } from "../../firebase";
import { BookOpen, Loader, Zap } from "lucide-react";

export default function CreateTest({ profile, onBack, onMonitor, user }) {
  const [tab, setTab] = useState("quick");

  // Form state
  const [title, setTitle] = useState("");
  const [classId, setClassId] = useState("");
  const [examType, setExamType] = useState(profile?.examType || "JEE");
  const [subject, setSubject] = useState("Physics");
  const [chapter, setChapter] = useState("");
  const [count, setCount] = useState(10);
  const [duration, setDuration] = useState(20);
  const [difficulty, setDifficulty] = useState("Medium");
  const [strict, setStrict] = useState(true);

  // Firebase classes
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Question generation
  const [generating, setGenerating] = useState(false);

  const subjects = SUBJECTS[examType] || SUBJECTS["Custom"];

  useEffect(() => {
    if (user?.uid) {
      getTeacherClasses(user.uid).then(data => {
        setClasses(data);
        if (data.length > 0) setClassId(data[0].id);
        setLoadingClasses(false);
      }).catch(() => setLoadingClasses(false));
    } else {
      setLoadingClasses(false);
    }
  }, [user]);

  const handleGenerateAndLaunch = async () => {
    if (!title.trim()) { toast.warn("Please enter a test title"); return; }
    if (!chapter.trim()) { toast.warn("Please enter a chapter or topic"); return; }

    setGenerating(true);
    try {
      const questions = await generateQuestions({
        examType,
        subject,
        chapter,
        count,
        difficulty,
        level: "Intermediate",
      });
      toast.success(`✅ ${questions.length} questions generated!`);
      onMonitor({
        title,
        classId,
        questions,
        examType,
        subject,
        chapter,
        difficulty,
        duration,
        strict,
        numQuestions: count,
        role: "teacher",
      });
    } catch (err) {
      console.error('FULL ERROR:', err);
      alert(
        `Failed to generate questions!\n\n` +
        `Error: ${err.message}\n\n` +
        `Please check:\n` +
        `• API key is valid\n` +
        `• API key has credits at platform.openai.com\n` +
        `• Internet connection is working\n\n` +
        `Then try again.`
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSyllabusGenerated = (questions, config) => {
    if (!title.trim()) { toast.warn("Please enter a test title at the top"); return; }
    toast.success(`✅ ${questions.length} questions from syllabus!`);
    onMonitor({
      title,
      classId,
      questions,
      examType: config.examType || examType,
      subject: config.subject || subject,
      chapter: (config.selectedTopics || []).join(", ") || "Syllabus",
      difficulty: config.difficulty || difficulty,
      duration,
      strict,
      numQuestions: questions.length,
      role: "teacher",
    });
  };

  return (
    <div style={{ minHeight: '100vh', padding: '32px 16px', background: '#F8FAFC' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <PageHeader
          title="📝 Create Test"
          subtitle="Generate AI questions and launch a class test"
          back="Dashboard"
          onBack={onBack}
        />

        <div style={{ background: '#FFF', borderRadius: '20px', padding: '0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1.5px solid #F1F5F9', overflow: 'hidden' }}>

          {/* ── Common fields (Title + Class + Duration + Strict) ── */}
          <div style={{ padding: '28px 28px 0 28px' }}>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Test Title *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Unit 3 Formative Assessment"
                style={{ width: '100%', borderRadius: '12px', border: '1.5px solid #E2E8F0', padding: '13px 16px', fontSize: '14px', outline: 'none', color: '#1E293B', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#0D9488'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Select Class</label>
                {loadingClasses ? (
                  <div style={{ padding: '12px', color: '#94A3B8', fontSize: '13px' }}>Loading classes...</div>
                ) : classes.length > 0 ? (
                  <select
                    value={classId}
                    onChange={e => setClassId(e.target.value)}
                    style={{ width: '100%', borderRadius: '12px', border: '1.5px solid #E2E8F0', padding: '13px 16px', fontSize: '14px', outline: 'none', background: '#FFF', color: '#1E293B', cursor: 'pointer' }}
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.className} ({c.subject})</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px dashed #E2E8F0', color: '#94A3B8', fontSize: '13px' }}>
                    No classes yet — create one first
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  min={5}
                  max={180}
                  onChange={e => setDuration(+e.target.value)}
                  style={{ width: '100%', borderRadius: '12px', border: '1.5px solid #E2E8F0', padding: '13px 16px', fontSize: '14px', outline: 'none', color: '#1E293B', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Strict Mode toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', borderRadius: '12px', padding: '14px 18px', border: '1.5px solid #E2E8F0', marginBottom: '24px' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '14px' }}>🔒 Strict Mode (Tab Lock)</div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>Auto-submit after 3 tab switches — prevents cheating</div>
              </div>
              <button
                onClick={() => setStrict(s => !s)}
                style={{ width: '52px', height: '28px', borderRadius: '14px', position: 'relative', background: strict ? '#10B981' : '#CBD5E1', border: 'none', cursor: 'pointer', transition: 'background 0.3s', flexShrink: 0 }}
              >
                <span style={{ position: 'absolute', top: '3px', width: '22px', height: '22px', borderRadius: '50%', background: '#FFF', boxShadow: '0 2px 4px rgba(0,0,0,0.25)', transition: 'left 0.3s', left: strict ? '27px' : '3px' }} />
              </button>
            </div>
          </div>

          {/* ── Tab Switcher ── */}
          <div style={{ display: 'flex', borderTop: '2px solid #F1F5F9', borderBottom: '2px solid #F1F5F9', background: '#FAFAFA' }}>
            {[
              { id: 'quick', label: '⚡ Quick Topics' },
              { id: 'syllabus', label: '📄 From Syllabus' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{ flex: 1, padding: '15px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: tab === t.id ? '#0D9488' : '#64748B', borderBottom: tab === t.id ? '3px solid #0D9488' : '3px solid transparent', transition: 'all 0.2s' }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab Content ── */}
          <div style={{ padding: '24px 28px 28px 28px' }}>
            {tab === 'quick' ? (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                {/* Exam Type + Subject */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Exam Type</label>
                    <select
                      value={examType}
                      onChange={e => { setExamType(e.target.value); setSubject(SUBJECTS[e.target.value]?.[0] || 'Mathematics'); }}
                      style={{ width: '100%', borderRadius: '12px', border: '1.5px solid #E2E8F0', padding: '12px 16px', fontSize: '13px', outline: 'none', color: '#1E293B', cursor: 'pointer' }}
                    >
                      {EXAM_TYPES.map(e => <option key={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Subject</label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      style={{ width: '100%', borderRadius: '12px', border: '1.5px solid #E2E8F0', padding: '12px 16px', fontSize: '13px', outline: 'none', color: '#1E293B', cursor: 'pointer' }}
                    >
                      {subjects.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Chapter/Topic */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Chapter / Topic *</label>
                  <input
                    value={chapter}
                    onChange={e => setChapter(e.target.value)}
                    placeholder="e.g. Laws of Motion, Electrochemistry, Mughal Empire..."
                    style={{ width: '100%', borderRadius: '12px', border: '1.5px solid #E2E8F0', padding: '13px 16px', fontSize: '14px', outline: 'none', color: '#1E293B', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#0D9488'}
                    onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                  />
                </div>

                {/* Count + Difficulty */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Questions</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[5, 10, 15, 20].map(n => (
                        <button key={n} onClick={() => setCount(n)} style={{ flex: 1, padding: '10px 0', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer', color: count === n ? '#FFF' : '#475569', background: count === n ? '#0D9488' : '#F1F5F9', transition: 'all 0.2s' }}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={e => setDifficulty(e.target.value)}
                      style={{ width: '100%', borderRadius: '12px', border: '1.5px solid #E2E8F0', padding: '12px 16px', fontSize: '13px', outline: 'none', color: '#1E293B', cursor: 'pointer' }}
                    >
                      {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                {/* Generate + Launch Button */}
                <button
                  onClick={handleGenerateAndLaunch}
                  disabled={generating || !title.trim()}
                  style={{ width: '100%', padding: '16px', borderRadius: '14px', color: '#FFF', fontWeight: '800', fontSize: '15px', border: 'none', cursor: (generating || !title.trim()) ? 'not-allowed' : 'pointer', background: (generating || !title.trim()) ? '#94A3B8' : 'linear-gradient(135deg,#0D1B4B,#0D9488)', boxShadow: '0 6px 20px rgba(13,148,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}
                >
                  {generating ? (
                    <><Loader size={18} style={{ animation: 'spin 1.5s linear infinite' }} /> Generating Questions...</>
                  ) : (
                    <><Zap size={18} /> Generate AI Test & Launch</>
                  )}
                </button>

                {!title.trim() && (
                  <p style={{ textAlign: 'center', fontSize: '12px', color: '#94A3B8', margin: '10px 0 0 0' }}>
                    Fill in the test title above to enable
                  </p>
                )}
              </div>
            ) : (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <SyllabusUploader profile={profile} role="teacher" onGenerated={handleSyllabusGenerated} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
