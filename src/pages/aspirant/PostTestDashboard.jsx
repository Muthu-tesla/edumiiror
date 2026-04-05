import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CheckCircle, XCircle, Minus, Brain, Loader, BookOpen, TrendingUp } from "lucide-react";
import { analyzePerformance, explainAnswer } from "../../api/gpt4o";
import { AIBadge } from "../../components/UI";
import { toast } from "../../components/Toast";
import ChatBot from "../../components/ChatBot";

const fmt = s => `${Math.floor(s/60)}m ${s%60}s`;

export default function PostTestDashboard({ questions, answers, config, timeTaken, onRetakeTest, onHome, onJournal, user }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [aiAnalysis,   setAiAnalysis]   = useState(null);
  const [analysisLoad, setAnalysisLoad] = useState(true);
  const [explanations, setExplanations] = useState({});
  const [explainLoad,  setExplainLoad]  = useState({});

  const correct = questions.filter(q => answers[q.id] === q.correct).length;
  const wrong   = questions.filter(q => answers[q.id] && answers[q.id] !== q.correct).length;
  const skipped = questions.filter(q => !answers[q.id]).length;
  const pct     = ((correct / questions.length) * 100).toFixed(1);

  const conceptMap = {};
  questions.forEach(q => {
    if (!conceptMap[q.concept]) conceptMap[q.concept] = { total:0, correct:0 };
    conceptMap[q.concept].total++;
    if (answers[q.id] === q.correct) conceptMap[q.concept].correct++;
  });
  const chartData = Object.entries(conceptMap).map(([name, d]) => ({
    name, score: Math.round((d.correct/d.total)*100)
  }));
  const wrongConcepts = questions.filter(q => answers[q.id] !== q.correct).map(q => q.concept);

  useEffect(() => {
    let frame;
    const target = correct;
    const step = () => {
      setDisplayScore(prev => {
        if (prev >= target) return target;
        frame = requestAnimationFrame(step);
        return prev + 1;
      });
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [correct]);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await analyzePerformance({
          examType: config.examType, subject: config.subject,
          score: correct, total: questions.length,
          conceptScores: chartData, wrongConcepts, timeTaken: fmt(timeTaken)
        });
        setAiAnalysis(data);
      } catch {
        setAiAnalysis({
          summary: `You scored ${correct}/${questions.length} (${pct}%). ${correct >= questions.length*0.6 ? "Good performance! Keep it up." : "Keep practicing to improve your score."}`,
          weakAreas: wrongConcepts.slice(0,3).filter((v,i,a)=>a.indexOf(v)===i),
          nextSteps:  ["Review wrong answers carefully", "Practice more questions on weak topics", "Revise concepts from textbook"],
          motivation: "Every expert was once a beginner. Keep going! 🚀"
        });
      } finally { setAnalysisLoad(false); }
    };
    run();
  }, []);

  const getExplanation = async (q) => {
    if (explanations[q.id] || explainLoad[q.id]) return;
    setExplainLoad(prev => ({...prev, [q.id]:true}));
    try {
      const text = await explainAnswer({
        question: q.question, correct: `${q.correct}: ${q.options[q.correct]}`,
        studentAnswer: answers[q.id] ? `${answers[q.id]}: ${q.options[answers[q.id]]}` : "Not answered",
        concept: q.concept
      });
      setExplanations(prev => ({...prev, [q.id]:text}));
    } catch {
      setExplanations(prev => ({...prev, [q.id]: q.explanation}));
    } finally { setExplainLoad(prev => ({...prev, [q.id]:false})); }
  };

  const grade = pct >= 90?"A+":pct>=75?"A":pct>=60?"B":pct>=40?"C":"D";
  const gradeColor = pct>=75?"#10B981":pct>=40?"#F59E0B":"#EF4444";

  return (
    <div style={{ padding: '32px 16px', background: '#F8FAFC', minHeight: '100vh', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <div style={{ borderRadius: '24px', color: '#FFFFFF', padding: '32px', display: 'flex', alignItems: 'center', gap: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', background: 'linear-gradient(135deg,#0D1B4B 0%,#0f2563 50%,#0D1B4B 100%)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '72px', fontWeight: 'bold', color: gradeColor, lineHeight: 1 }}>{grade}</div>
            <div style={{ color: '#CBD5E1', fontSize: '14px', marginTop: '4px' }}>Grade</div>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', margin: 0 }}>Test Complete! 🎉</h2>
            <p style={{ color: '#CBD5E1', fontSize: '14px', marginBottom: '16px', margin: '0 0 16px 0' }}>{config.subject} · {config.chapter} · {config.examType}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {[
                {label:"Score",    val:`${displayScore}/${questions.length}`, color:"#14B8A6"},
                {label:"Percent",  val:`${pct}%`,           color:"#60a5fa"},
                {label:"Time",     val:fmt(timeTaken),       color:"#a78bfa"},
                {label:"Accuracy", val:`${questions.length-skipped>0?((correct/(questions.length-skipped))*100).toFixed(0):0}%`, color:"#f59e0b"},
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: '12px', color: '#CBD5E1' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            {icon:<CheckCircle size={20} color="#10B981" />, label:"Correct", val:correct, color:"#10B981", bg:"#d1fae5"},
            {icon:<XCircle size={20} color="#EF4444" />,     label:"Wrong",   val:wrong,   color:"#EF4444", bg:"#fee2e2"},
            {icon:<Minus size={20} color="#F59E0B" />,       label:"Skipped", val:skipped, color:"#F59E0B", bg:"#fef9c3"},
          ].map(s => (
            <div key={s.label} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.bg }}>{s.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '14px', color: '#64748B' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {chartData.length > 0 && (
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '0' }}>
            <h3 style={{ fontWeight: 'bold', color: '#1E293B', marginBottom: '16px', fontSize: '18px', margin: '0 0 16px 0' }}>Concept Performance</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{top:0,right:0,left:-20,bottom:0}}>
                <XAxis dataKey="name" tick={{fontSize:11}} />
                <YAxis domain={[0,100]} tick={{fontSize:11}} tickFormatter={v=>`${v}%`}/>
                <Tooltip formatter={v=>[`${v}%`,"Score"]} />
                <Bar dataKey="score" radius={[6,6,0,0]}>
                  {chartData.map((d,i) => (
                    <Cell key={i} fill={d.score>=60?"#0D9488":d.score>=40?"#F59E0B":"#EF4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Brain size={20} color="#0D9488" />
            <h3 style={{ fontWeight: 'bold', color: '#1E293B', fontSize: '18px', margin: 0 }}>AI Performance Analysis</h3>
            <AIBadge/>
          </div>
          {analysisLoad ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0', color: '#94A3B8', fontSize: '14px' }}>
              <Loader size={18} color="#94A3B8" style={{ animation: 'spin 1.5s linear infinite' }} />
              Analyzing your performance with AI…
            </div>
          ) : aiAnalysis && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: '#334155', fontSize: '14px', background: '#F8FAFC', borderRadius: '12px', padding: '16px', margin: 0 }}>{aiAnalysis.summary}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ borderRadius: '12px', padding: '16px', background: '#FEF2F2' }}>
                  <div style={{ fontWeight: '600', color: '#DC2626', fontSize: '14px', marginBottom: '8px' }}>⚠ Weak Areas</div>
                  <ul style={{ paddingLeft: '16px', margin: 0, color: '#B91C1C', fontSize: '12px' }}>{aiAnalysis.weakAreas?.map((a,i)=><li key={i}>{a}</li>)}</ul>
                </div>
                <div style={{ borderRadius: '12px', padding: '16px', background: '#F0FDF4' }}>
                  <div style={{ fontWeight: '600', color: '#16A34A', fontSize: '14px', marginBottom: '8px' }}>✅ Next Steps</div>
                  <ul style={{ paddingLeft: '16px', margin: 0, color: '#15803D', fontSize: '12px' }}>{aiAnalysis.nextSteps?.map((s,i)=><li key={i}>{s}</li>)}</ul>
                </div>
                <div style={{ borderRadius: '12px', padding: '16px', background: '#EFF6FF' }}>
                  <div style={{ fontWeight: '600', color: '#2563EB', fontSize: '14px', marginBottom: '8px' }}>💪 Motivation</div>
                  <p style={{ color: '#1D4ED8', fontSize: '12px', margin: 0 }}>{aiAnalysis.motivation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '0' }}>
          <h3 style={{ fontWeight: 'bold', color: '#1E293B', marginBottom: '16px', fontSize: '18px', margin: '0 0 16px 0' }}>Answer Review</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {questions.map((q, idx) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correct;
              const isSkipped = !userAns;
              return (
                <div key={q.id} style={{ borderRadius: '12px', border: '2px solid transparent', padding: '16px', borderColor: isCorrect ? '#BBF7D0' : isSkipped ? '#FEF08A' : '#FECACA', background: isCorrect ? '#F0FDF4' : isSkipped ? '#FEFCE8' : '#FEF2F2' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    {isCorrect ? <CheckCircle size={16} color="#22C55E" style={{ marginTop: '2px', flexShrink: 0 }} /> : isSkipped ? <Minus size={16} color="#EAB308" style={{ marginTop: '2px', flexShrink: 0 }} /> : <XCircle size={16} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />}
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B', margin: 0 }}>{idx+1}. {q.question}</p>
                  </div>
                  <div style={{ marginLeft: '24px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><span style={{ fontWeight: '600', color: '#15803D' }}>Correct: </span>{q.correct}. {q.options[q.correct]}</div>
                    {!isCorrect && userAns && <div><span style={{ fontWeight: '600', color: '#DC2626' }}>Your answer: </span>{userAns}. {q.options[userAns]}</div>}
                  </div>
                  {!isCorrect && (
                    <div style={{ marginLeft: '24px', marginTop: '12px' }}>
                      {explanations[q.id] ? (
                        <p style={{ fontSize: '12px', color: '#475569', background: '#FFFFFF', borderRadius: '8px', padding: '12px', border: '1px solid #E2E8F0', margin: 0 }}>{explanations[q.id]}</p>
                      ) : (
                        <button onClick={() => getExplanation(q)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#0D9488', fontWeight: '500', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                          {explainLoad[q.id] ? <><Loader size={12} color="#0D9488" style={{ animation: 'spin 1.5s linear infinite' }} />Loading AI explanation…</> : <><Brain size={12} color="#0D9488" />Get AI Explanation</>}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', paddingBottom: '24px' }}>
          <button onClick={onHome} style={{ padding: '12px 24px', borderRadius: '12px', border: '2px solid #E2E8F0', color: '#334155', fontWeight: '600', fontSize: '14px', background: 'transparent', cursor: 'pointer' }}>🏠 Home</button>
          <button onClick={onJournal} style={{ padding: '12px 24px', borderRadius: '12px', border: '2px solid #E2E8F0', color: '#334155', fontWeight: '600', fontSize: '14px', background: 'transparent', cursor: 'pointer' }}>📓 Mistake Journal</button>
          <button onClick={onRetakeTest}
            style={{ padding: '12px 24px', borderRadius: '12px', color: '#FFFFFF', fontWeight: '600', fontSize: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', background: 'linear-gradient(135deg,#0D9488,#14B8A6)' }}>
            🔁 Take Another Test
          </button>
        </div>
      </div>
      <ChatBot profile={{...config, name: "Student"}} user={user} />
    </div>
  );
}
