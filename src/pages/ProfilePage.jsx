import { User, Award, BookOpen, Clock, Settings, ChevronLeft } from "lucide-react";

export default function ProfilePage({ profile, onBack }) {
  if (!profile) return null;

  const DetailRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
      <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>{label}</span>
      <span style={{ fontSize: '14px', color: '#1E293B', fontWeight: '600', textAlign: 'right' }}>{value || "Not set"}</span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '40px 16px', background: '#F8FAFC', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={onBack} style={{ fontSize: '14px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '24px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={16}/> Back
        </button>

        <div style={{ background: '#FFFFFF', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.05)', marginBottom: '24px', border: '1px solid #F1F5F9' }}>
          <div style={{ background: 'linear-gradient(135deg,#0D1B4B,#0D9488)', height: '120px', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: '-40px', left: '32px', width: '80px', height: '80px', borderRadius: '50%', background: '#F8FAFC', border: '4px solid #FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: '#0D1B4B', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
            </div>
            <button style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.2)', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Settings size={14}/> Edit Profile
            </button>
          </div>
          
          <div style={{ padding: '56px 32px 32px 32px' }}>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#1E293B', fontWeight: 'bold' }}>{profile.name}</h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748B', textTransform: 'capitalize' }}>{profile.role} • {profile.city || profile.schoolName || profile.board}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '32px' }}>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px' }}>
                <BookOpen size={20} color="#0D9488" style={{ marginBottom: '8px' }}/>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Target/Focus</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>{profile.examType || "General Studies"}</div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px' }}>
                <Clock size={20} color="#6366f1" style={{ marginBottom: '8px' }}/>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Daily Commitment</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>{profile.dailyHours || "Not set"}</div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px' }}>
                <Award size={20} color="#F59E0B" style={{ marginBottom: '8px' }}/>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Level/Exp</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>{profile.prepLevel || profile.experience ? `${profile.experience} yrs` : "N/A"}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E293B', margin: '0 0 24px 0' }}>Personal Information</h2>
            <DetailRow label="Full Name" value={profile.name}/>
            <DetailRow label="Age" value={profile.age}/>
            <DetailRow label="City" value={profile.city}/>
            {profile.schoolName && <DetailRow label="Institution" value={profile.schoolName}/>}
            {profile.board && <DetailRow label="Board" value={profile.board}/>}
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E293B', margin: '0 0 24px 0' }}>Academic Profile</h2>
            {(profile.strongSubjects?.length > 0 || profile.subjectsTaught?.length > 0) && (
              <div style={{ padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500', marginBottom: '8px' }}>Strengths/Subjects</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(profile.strongSubjects || profile.subjectsTaught || []).map(s => <span key={s} style={{ background: '#F0FDFA', color: '#0D9488', fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '12px' }}>{s}</span>)}
                </div>
              </div>
            )}
            {profile.weakSubjects?.length > 0 && (
              <div style={{ padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500', marginBottom: '8px' }}>Areas to Improve</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {profile.weakSubjects.map(s => <span key={s} style={{ background: '#FEF2F2', color: '#EF4444', fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '12px' }}>{s}</span>)}
                </div>
              </div>
            )}
            {profile.examDate && <DetailRow label="Target Exam Date" value={new Date(profile.examDate).toLocaleDateString()}/>}
            {profile.targetScore && <DetailRow label="Target Score" value={profile.targetScore}/>}
            {profile.classesHandled?.length > 0 && <DetailRow label="Classes" value={profile.classesHandled.join(", ")}/>}
          </div>
        </div>

      </div>
    </div>
  );
}
