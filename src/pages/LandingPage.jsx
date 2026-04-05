import { BookOpen, Zap, Users, Star, Shield, Brain } from "lucide-react";

export default function LandingPage({ onSelect }) {
  const roles = [
    {
      id: "aspirant",
      icon: <Brain size={36}/>,
      title: "Aspirant",
      sub: "Self Learner",
      desc: "Prepare for JEE, NEET, UPSC and more with AI-generated tests, smart mistake tracking, and a personalized study plan.",
      gradient: "linear-gradient(135deg,#0D9488,#14B8A6)",
      btn: "Start Learning",
    },
    {
      id: "teacher",
      icon: <Users size={36}/>,
      title: "Teacher",
      sub: "Educator",
      desc: "Create class groups, conduct tests with anti-cheat tab-lock, and get AI-powered class analytics to guide your students.",
      gradient: "linear-gradient(135deg,#0D1B4B,#1e3a8a)",
      btn: "Enter Dashboard",
    },
    {
      id: "student",
      icon: <Star size={36}/>,
      title: "Student",
      sub: "Class Member",
      desc: "Join your teacher's class with a 6-digit code, take scheduled tests, and track your performance with AI insights.",
      gradient: "linear-gradient(135deg,#7c3aed,#6d28d9)",
      btn: "Join Class",
    },
  ];

  const features = [
    { icon:<Zap size={20}/>,    text:"GPT-4o question generation" },
    { icon:<Shield size={20}/>, text:"Smart tab-lock & anti-cheat" },
    { icon:<BookOpen size={20}/>,text:"Mistake journal & study plans" },
    { icon:<Brain size={20}/>,  text:"AI doubt solver chat" },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0D1B4B' }}>
      <div style={{ background: 'linear-gradient(135deg, #0D1B4B 0%, #0D9488 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#FFFFFF', textAlign: 'center', padding: '40px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0D9488,#14B8A6)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <BookOpen size={28} color="#FFFFFF" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF' }}>EduMirror Pro</div>
            <div style={{ fontSize: '12px', color: '#14B8A6' }}>Powered by GPT-4o</div>
          </div>
        </div>

        <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '16px' }}>
          Your AI Study Partner.<br/>
          <span style={{ color: '#14B8A6' }}>Your Personal Exam Coach.</span>
        </h1>

        <p style={{ color: '#F8FAFC', fontSize: '18px', maxWidth: '600px', marginBottom: '32px' }}>
          AI-powered test generation, real-time analytics, smart mistake tracking, and personalized study plans — all in one platform.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginBottom: '48px' }}>
          {features.map((f,i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '24px', fontSize: '14px', color: '#14B8A6', border: '1px solid #0D9488', background: 'rgba(13, 148, 136, 0.1)' }}>
              {f.icon}{f.text}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', width: '100%', maxWidth: '900px' }}>
          {roles.map((r) => (
            <div
              key={r.id}
              onClick={() => onSelect(r.id)}
              style={{ background: '#FFFFFF', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer' }}
            >
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', marginBottom: '16px', background: r.gradient, boxShadow: '0 4px 8px rgba(0,0,0,0.15)' }}>
                {r.icon}
              </div>
              <div style={{ color: '#0D1B4B', fontWeight: 'bold', fontSize: '20px', marginBottom: '4px' }}>{r.title}</div>
              <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '12px', padding: '4px 12px', borderRadius: '24px', background: 'rgba(20, 184, 166, 0.2)', color: '#0D9488' }}>
                {r.sub}
              </div>
              <p style={{ color: '#1E293B', fontSize: '14px', marginBottom: '24px', flex: 1 }}>{r.desc}</p>
              <button
                style={{ background: '#0D9488', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', width: '100%' }}
              >
                {r.btn}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
