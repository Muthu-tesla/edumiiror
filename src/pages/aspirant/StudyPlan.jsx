import { useState, useEffect } from "react";
import { Calendar, Loader, Brain, RefreshCw } from "lucide-react";
import { generateStudyPlan } from "../../api/gpt4o";
import { AIBadge } from "../../components/UI";
import { toast } from "../../components/Toast";
import ChatBot from "../../components/ChatBot";

const DAY_COLORS = ["#0D9488","#14B8A6","#0ea5e9","#6366f1","#8b5cf6","#ec4899","#f59e0b"];

export default function StudyPlan({ user, profile, tests = [], journal = [], onBack }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const weakConcepts = [...new Set(journal.map(j => j.concept || j.conceptName).filter(Boolean))].slice(0, 5);
  const avgScore = tests.length
    ? Math.round(tests.reduce((s, t) => s + (t.percentage || 0), 0) / tests.length)
    : 0;

  const generate = async () => {
    setLoading(true);
    try {
      const data = await generateStudyPlan({
        name: profile?.name || 'Student',
        examType: profile?.examType || 'JEE Main',
        examDate: profile?.examDate || '',
        weakSubjects: profile?.weakSubjects || weakConcepts,
        strongSubjects: profile?.strongSubjects || [],
        level: profile?.level || 'Intermediate',
        studyHours: profile?.studyHours || '2-4 hours',
      });
      setPlan(data);
      toast.success("📅 Study plan generated!");
    } catch {
      // Fallback static plan
      setPlan({
        totalDays: 30,
        examName: profile?.examType || 'JEE Main',
        overview: `Focus on your weak areas (${weakConcepts.join(', ') || 'core subjects'}) while maintaining consistent daily practice. Aim for gradual score improvement through structured revision.`,
        weeks: [
          {
            weekNumber: 1, days: "Days 1-7", theme: "Foundation & Weak Area Focus",
            focusSubject: weakConcepts[0] || "Physics",
            focusTopic: "Core Concepts",
            dailyTasks: ["Day 1-2: Read theory", "Day 3-4: Practice MCQs", "Day 5-6: Revision", "Day 7: Mock test"],
            dailyQuestions: 15, weeklyGoal: "Build conceptual clarity in weak areas"
          },
          {
            weekNumber: 2, days: "Days 8-14", theme: "Speed & Accuracy",
            focusSubject: weakConcepts[1] || "Mathematics",
            focusTopic: "Problem Solving",
            dailyTasks: ["Day 8-9: Formula sheet", "Day 10-11: Timed practice", "Day 12-13: Full chapter revision", "Day 14: Weekly test"],
            dailyQuestions: 20, weeklyGoal: "Improve speed in solving problems"
          },
          {
            weekNumber: 3, days: "Days 15-21", theme: "Full Length Practice",
            focusSubject: "All Subjects",
            focusTopic: "Mixed Practice",
            dailyTasks: ["Day 15-16: Full syllabus questions", "Day 17-18: Analysis of errors", "Day 19-20: Targeted revision", "Day 21: Full mock test"],
            dailyQuestions: 30, weeklyGoal: "Score 70%+ in mock tests consistently"
          },
          {
            weekNumber: 4, days: "Days 22-30", theme: "Final Sprint & Revision",
            focusSubject: "Revision Mode",
            focusTopic: "Key Formulas & Concepts",
            dailyTasks: ["Day 22-24: Rapid revision", "Day 25-27: Previous year papers", "Day 28-29: Light practice", "Day 30: Rest & confidence boost"],
            dailyQuestions: 10, weeklyGoal: "Maintain confidence and sharpen weak areas"
          }
        ],
        finalWeekStrategy: "Focus on revision only. No new topics. Sleep well, eat well.",
        dailyRoutine: {
          morning: "6-8 AM: Study most difficult subject when mind is fresh",
          afternoon: "2-4 PM: Practice questions and solve MCQs",
          evening: "6-8 PM: Revise notes and formulas",
          night: "9-10 PM: Quick review of today's mistakes"
        },
        importantTips: [
          "Consistency beats intensity — study 4 hours daily rather than 8 hours occasionally",
          "Review your Mistake Journal after every test",
          "Use Pomodoro — 25 min study, 5 min break"
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generate();
  }, []);

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
              <h1 style={{ color: '#0D1B4B', fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0' }}>📅 Study Plan</h1>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                AI-personalized roadmap for <strong>{profile?.examType || 'your exam'}</strong>
              </p>
            </div>
            <button
              onClick={generate}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#0D9488,#14B8A6)', color: '#FFF', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', opacity: loading ? 0.7 : 1 }}
            >
              <RefreshCw size={14} color="#FFF" style={{ animation: loading ? 'spin 1.5s linear infinite' : 'none' }} />
              Regenerate
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: '16px' }}>
            <div style={{ fontSize: '48px', animation: 'spin 2s linear infinite' }}>🧠</div>
            <p style={{ color: '#0D9488', fontWeight: '700', fontSize: '18px', margin: 0 }}>GPT-4o is building your plan...</p>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Analyzing your weak areas and exam timeline</p>
          </div>
        )}

        {/* Plan */}
        {!loading && plan && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Overview */}
            <div style={{ background: 'linear-gradient(135deg,#0D1B4B,#1e3a8a)', borderRadius: '20px', padding: '24px', color: '#FFF', boxShadow: '0 8px 24px rgba(13,27,75,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Brain size={20} color="#5EEAD4" />
                <span style={{ fontWeight: '700', fontSize: '16px' }}>Your Study Strategy</span>
                <AIBadge />
              </div>
              <p style={{ color: '#CBD5E1', fontSize: '14px', lineHeight: '1.6', margin: '0 0 16px 0' }}>{plan.overview}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Total Days', value: plan.totalDays, emoji: '📅' },
                  { label: 'Exam', value: plan.examName, emoji: '🎯' },
                  { label: 'Avg Score', value: `${avgScore}%`, emoji: '📊' },
                ].map(({ label, value, emoji }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>{emoji}</div>
                    <div style={{ fontWeight: '800', color: '#5EEAD4', fontSize: '16px' }}>{value}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Routine */}
            {plan.dailyRoutine && (
              <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#0D1B4B', fontSize: '16px', fontWeight: '700' }}>⏰ Daily Routine</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {Object.entries(plan.dailyRoutine).map(([time, task]) => (
                    <div key={time} style={{ background: '#F8FAFC', borderRadius: '10px', padding: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#0D9488', textTransform: 'capitalize', marginBottom: '4px' }}>{time}</div>
                      <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>{task}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Plan */}
            <h3 style={{ color: '#0D1B4B', margin: '4px 0', fontSize: '18px', fontWeight: '700' }}>📆 Week-by-Week Plan</h3>
            {plan.weeks?.map((week, i) => (
              <div key={i} style={{ background: '#FFF', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9', display: 'flex', gap: '16px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: '800', fontSize: '10px', flexShrink: 0, background: DAY_COLORS[i % DAY_COLORS.length] }}>
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>W{week.weekNumber}</span>
                  <span style={{ fontSize: '9px', opacity: 0.85 }}>{week.days}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                    <div>
                      <span style={{ fontWeight: '700', color: '#1E293B', fontSize: '15px' }}>{week.theme}</span>
                      <div style={{ fontSize: '13px', color: '#0D9488', fontWeight: '600', marginTop: '2px' }}>
                        Focus: {week.focusSubject} — {week.focusTopic}
                      </div>
                    </div>
                    <div style={{ background: '#F0FDFA', color: '#0D9488', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>
                      📝 {week.dailyQuestions} Q/day
                    </div>
                  </div>
                  <ul style={{ margin: '0 0 10px 0', padding: '0 0 0 16px', listStyleType: 'disc' }}>
                    {week.dailyTasks?.map((t, j) => (
                      <li key={j} style={{ fontSize: '13px', color: '#475569', marginBottom: '4px', lineHeight: '1.4' }}>{t}</li>
                    ))}
                  </ul>
                  <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#6366f1', fontWeight: '600', border: '1px solid #E0E7FF' }}>
                    🎯 Goal: {week.weeklyGoal}
                  </div>
                </div>
              </div>
            ))}

            {/* Final Week */}
            {plan.finalWeekStrategy && (
              <div style={{ background: 'linear-gradient(135deg,#FFF7ED,#FEF9C3)', borderRadius: '16px', padding: '20px', border: '1.5px solid #FEF08A' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#92400E', fontWeight: '700' }}>🏁 Final Week Strategy</h4>
                <p style={{ margin: 0, color: '#78350F', fontSize: '14px', lineHeight: '1.5' }}>{plan.finalWeekStrategy}</p>
              </div>
            )}

            {/* Tips */}
            {plan.importantTips && plan.importantTips.length > 0 && (
              <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9' }}>
                <h3 style={{ margin: '0 0 14px 0', color: '#0D1B4B', fontSize: '16px', fontWeight: '700' }}>💡 Pro Tips</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {plan.importantTips.map((tip, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', background: '#F0FDFA', borderRadius: '10px', border: '1px solid #CCFBF1' }}>
                      <span style={{ color: '#0D9488', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>{i + 1}.</span>
                      <p style={{ margin: 0, fontSize: '13px', color: '#0D9488', lineHeight: '1.4' }}>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
      <ChatBot profile={profile} user={user} />
    </div>
  );
}
