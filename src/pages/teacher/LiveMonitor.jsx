import { useState, useEffect, useRef } from "react";
import { saveTestResult, getUserProfile, checkAndAwardBadges, updateDailyChallenges } from "../../firebase";
import { updateDoc, doc, increment } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "../../components/Toast";
import PostTestDashboard from "../aspirant/PostTestDashboard";
import { calculateXP, getCurrentLevel } from "../../utils/gamification";
import XPCelebration from "../../components/XPCelebration";

/* ─────────────────────────────────────────
   INTERNAL TEST INTERFACE
───────────────────────────────────────── */
const TestInterface = ({ questions, config, profile, onComplete }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(questions.length * 120);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const startTime = useRef(Date.now());

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tab-lock warning
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const n = prev + 1;
          if (n >= 3) handleSubmit();
          return n;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const handleAnswer = (qId, option) =>
    setAnswers(prev => ({ ...prev, [qId]: option }));

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
    const conceptScores = {};
    questions.forEach(q => {
      if (!conceptScores[q.concept]) conceptScores[q.concept] = { correct: 0, total: 0 };
      conceptScores[q.concept].total++;
      if (answers[q.id] === q.correct) conceptScores[q.concept].correct++;
    });
    onComplete({ answers, questions, conceptScores, config, timeTaken, tabSwitches });
  };

  const q = questions[currentQ];
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isLow = timeLeft < 60;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'inherit' }}>
      {/* Tab-switch warning */}
      {tabSwitches > 0 && (
        <div style={{ background: tabSwitches >= 2 ? '#991b1b' : '#EF4444', color: '#FFF', padding: '10px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
          ⚠️ Tab switch detected — Warning {tabSwitches}/3
          {tabSwitches >= 2 && ' — Next switch auto-submits!'}
        </div>
      )}

      {/* Header */}
      <div style={{ background: '#0D1B4B', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <p style={{ color: '#FFF', fontWeight: '700', margin: 0, fontSize: '16px' }}>{config?.subject} Test</p>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '12px' }}>
            {config?.chapter} · Question {currentQ + 1}/{questions.length}
          </p>
        </div>
        <div style={{
          background: isLow ? '#EF4444' : '#0D9488', color: '#FFF',
          padding: '10px 22px', borderRadius: '10px', fontWeight: '800',
          fontSize: '22px', fontFamily: 'monospace',
          boxShadow: isLow ? '0 0 16px rgba(239,68,68,0.5)' : 'none',
          transition: 'all 0.3s'
        }}>
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 16px', display: 'grid', gridTemplateColumns: '1fr 200px', gap: '24px' }}>
        {/* Question Area */}
        <div>
          {/* Progress bar */}
          <div style={{ height: '5px', background: '#E2E8F0', borderRadius: '3px', marginBottom: '24px' }}>
            <div style={{ height: '100%', width: `${((currentQ + 1) / questions.length) * 100}%`, background: 'linear-gradient(90deg,#0D9488,#14B8A6)', borderRadius: '3px', transition: 'width 0.3s' }} />
          </div>

          <div style={{ background: '#FFF', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '24px' }}>
              <span style={{
                background: '#0D1B4B', color: '#FFF', width: '32px', height: '32px',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0
              }}>
                {currentQ + 1}
              </span>
              <p style={{ margin: 0, fontSize: '17px', color: '#1E293B', lineHeight: '1.6', fontWeight: '500' }}>
                {q.question}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(q.options).map(([key, value]) => {
                const selected = answers[q.id] === key;
                return (
                  <button key={key} onClick={() => handleAnswer(q.id, key)} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 18px', borderRadius: '12px', border: '2px solid',
                    borderColor: selected ? '#0D9488' : '#E2E8F0',
                    background: selected ? '#F0FDF9' : '#FFF',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s', fontFamily: 'inherit',
                    boxShadow: selected ? '0 0 0 3px rgba(13,148,136,0.15)' : 'none'
                  }}>
                    <span style={{
                      width: '30px', height: '30px', borderRadius: '50%',
                      border: '2px solid', borderColor: selected ? '#0D9488' : '#CBD5E1',
                      background: selected ? '#0D9488' : 'transparent',
                      color: selected ? '#FFF' : '#64748B',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '700', fontSize: '12px', flexShrink: 0
                    }}>
                      {key}
                    </span>
                    <span style={{ fontSize: '15px', color: selected ? '#0D9488' : '#1E293B', fontWeight: selected ? '600' : '400' }}>
                      {value}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              style={{ padding: '12px 24px', borderRadius: '10px', border: '2px solid #E2E8F0', background: '#FFF', color: currentQ === 0 ? '#CBD5E1' : '#64748B', cursor: currentQ === 0 ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'inherit' }}
            >
              ← Previous
            </button>

            {currentQ < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQ(currentQ + 1)}
                style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#0D9488', color: '#FFF', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'inherit' }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#EF4444,#DC2626)', color: '#FFF', cursor: 'pointer', fontSize: '14px', fontWeight: '700', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}
              >
                Submit Test ✓
              </button>
            )}
          </div>
        </div>

        {/* Question Palette */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', height: 'fit-content', position: 'sticky', top: '88px' }}>
          <p style={{ fontWeight: '700', color: '#0D1B4B', marginBottom: '14px', fontSize: '13px', margin: '0 0 14px 0' }}>Question Palette</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '18px' }}>
            {questions.map((question, i) => {
              const isAnswered = !!answers[question.id];
              const isCurrent = i === currentQ;
              return (
                <button key={i} onClick={() => setCurrentQ(i)} style={{
                  width: '34px', height: '34px', borderRadius: '8px',
                  border: isCurrent ? '2px solid #0D1B4B' : 'none',
                  background: isCurrent ? '#0D1B4B' : isAnswered ? '#10B981' : '#E2E8F0',
                  color: (isCurrent || isAnswered) ? '#FFF' : '#64748B',
                  cursor: 'pointer', fontSize: '11px', fontWeight: '700', fontFamily: 'inherit'
                }}>
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
            {[
              { bg: '#10B981', label: `Answered (${Object.keys(answers).length})` },
              { bg: '#E2E8F0', label: `Unanswered (${questions.length - Object.keys(answers).length})` },
              { bg: '#0D1B4B', label: 'Current' },
            ].map(({ bg, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: bg }} />
                {label}
              </div>
            ))}
          </div>

          <button onClick={handleSubmit} style={{
            width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg,#EF4444,#DC2626)', color: '#FFF',
            cursor: 'pointer', fontSize: '13px', fontWeight: '700', fontFamily: 'inherit'
          }}>
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   LIVE MONITOR WRAPPER
───────────────────────────────────────── */
export default function LiveMonitor({ config, onEnd, onJournal, profile, user }) {
  const [testData, setTestData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [xpCelebration, setXPCelebration] = useState(null);

  const handleTestComplete = async (data) => {
    setSaving(true);
    if (user?.uid) {
      try {
        const correct = data.questions.filter(q => data.answers[q.id] === q.correct).length;
        const percentage = Math.round((correct / data.questions.length) * 100);
        
        const results = {
          ...data,
          correct,
          wrong: data.questions.filter(q => data.answers[q.id] && data.answers[q.id] !== q.correct).length,
          total: data.questions.length,
          percentage,
        };

        // 1. Calculate XP earned
        const earnedXP = calculateXP(results);

        // 2. Save test to Firestore
        await saveTestResult(
          user.uid,
          user.displayName || "User",
          user.email || "user@example.com",
          results,
          config.classId || null
        );

        // 3. Update XP and coins in Firestore
        const oldProfile = await getUserProfile(user.uid);
        const oldXP = oldProfile?.totalXP || 0;
        const newXP = oldXP + earnedXP;
        const earnedCoins = Math.floor(earnedXP / 10);
        
        await updateDoc(doc(db, 'users', user.uid), {
          totalXP: newXP,
          coins: increment(earnedCoins)
        });

        // 4. Check level up
        const oldLevel = getCurrentLevel(oldXP);
        const newLevel = getCurrentLevel(newXP);
        const didLevelUp = newLevel.level > oldLevel.level ? newLevel : null;

        // 5. Check and award badges
        const stats = {
          testsCount: (oldProfile?.testsCount || 0) + 1,
          avgScore: oldProfile?.avgScore || 0,
          studyStreak: oldProfile?.studyStreak || 0,
          totalXP: newXP,
          hasPerfectScore: results.percentage === 100,
          highScoreCount: results.percentage >= 90 
            ? (oldProfile?.highScoreCount || 0) + 1 
            : (oldProfile?.highScoreCount || 0),
          cleanTests: results.tabSwitches === 0 
            ? (oldProfile?.cleanTests || 0) + 1 
            : (oldProfile?.cleanTests || 0),
          fastTest: results.timeTaken < 300 && results.total >= 10
        };

        const newBadges = await checkAndAwardBadges(user.uid, stats);

        // 6. Complete daily challenges
        await updateDailyChallenges(user.uid, results);

        toast.success("✅ Results saved to your profile!");

        // 8. Show celebration animation
        setXPCelebration({
          xp: earnedXP,
          newBadges,
          levelUp: didLevelUp
        });

      } catch (err) {
        console.error("Failed to save results:", err);
        toast.error("❌ Could not save — check connection");
      }
    }
    setSaving(false);
    setTestData(data);
  };

  if (saving) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D1B4B', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '48px', animation: 'spin 1.5s linear infinite' }}>⚙️</div>
        <p style={{ color: '#0D9488', fontSize: '18px', fontWeight: '700' }}>Saving your results...</p>
        <p style={{ color: '#64748B', fontSize: '14px' }}>Updating streak & analyzing performance</p>
      </div>
    );
  }

  if (testData) {
    return (
      <>
        {xpCelebration && (
          <XPCelebration
            xp={xpCelebration.xp}
            newBadges={xpCelebration.newBadges}
            levelUp={xpCelebration.levelUp}
          />
        )}
        <PostTestDashboard
          questions={testData.questions}
          answers={testData.answers}
          config={testData.config}
          timeTaken={testData.timeTaken}
          onRetakeTest={() => { setTestData(null); setXPCelebration(null); }}
          onHome={onEnd}
          onJournal={onJournal || onEnd}
          user={user}
        />
      </>
    );
  }

  if (!config || !config.questions || config.questions.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8FAFC', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>📭</div>
        <p style={{ fontSize: '18px', color: '#64748B', fontWeight: '600' }}>No questions available</p>
        <button onClick={onEnd} style={{ padding: '12px 24px', background: '#0D1B4B', color: '#FFF', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <TestInterface
      questions={config.questions}
      config={config}
      profile={profile}
      onComplete={handleTestComplete}
    />
  );
}
