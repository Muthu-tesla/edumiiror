import React, { useState } from 'react';
import { saveUserProfile } from '../firebase';

const subjectsList = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Economics', 'Computer Science'];
const classList = ['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'College'];
const examList = ['JEE Main', 'JEE Advanced', 'NEET', 'UPSC', 'GATE', 'CAT', 'Board Exam (10th)', 'Board Exam (12th)', 'Custom'];

const AspirantProfileSetup = ({ onComplete }) => {
  const [data, setData] = useState({
    name: '',
    examType: 'JEE Main',
    weakSubjects: [],
    level: 'Intermediate',
    examDate: '',
    studyHours: '2-4 hours'
  });

  const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  const toggleSubject = (subject) => {
    setData(prev => ({
      ...prev,
      weakSubjects: prev.weakSubjects.includes(subject)
        ? prev.weakSubjects.filter(s => s !== subject)
        : [...prev.weakSubjects, subject]
    }));
  };

  const submit = () => {
    if (!data.name.trim()) return alert("Please enter your name");
    onComplete({ ...data, role: 'aspirant' });
  };

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '560px', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', margin: 'auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '64px', height: '64px', background: '#0D9488', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px', color: '#fff' }}>🎯</div>
        <h2 style={{ color: '#0D1B4B', margin: '0 0 8px', fontSize: '28px', fontWeight: 'bold' }}>Aspirant Profile</h2>
        <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Quickly tell us about your goals</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>Full Name *</label>
          <input type="text" value={data.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Rahul Sharma" style={{ width: '100%', padding: '14px 16px', border: '2px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>Target Exam</label>
            <select value={data.examType} onChange={(e) => update('examType', e.target.value)} style={{ width: '100%', padding: '14px 16px', border: '2px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', outline: 'none', background: '#FFFFFF', cursor: 'pointer', boxSizing: 'border-box' }}>
              {examList.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>Exam Date</label>
            <input type="date" value={data.examDate} onChange={(e) => update('examDate', e.target.value)} style={{ width: '100%', padding: '14px 16px', border: '2px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', outline: 'none', background: '#FFFFFF', cursor: 'pointer', boxSizing: 'border-box' }}/>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>Preparation Level</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
              <button key={lvl} onClick={() => update('level', lvl)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: data.level === lvl ? 'none' : '2px solid #E2E8F0', background: data.level === lvl ? '#0D9488' : '#FFFFFF', color: data.level === lvl ? '#FFFFFF' : '#475569', fontWeight: data.level === lvl ? 'bold' : '600', cursor: 'pointer', fontSize: '14px' }}>{lvl}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>Weak Subjects (We'll focus here)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {subjectsList.map(s => (
              <button key={s} onClick={() => toggleSubject(s)} style={{ padding: '8px 16px', borderRadius: '24px', border: data.weakSubjects.includes(s) ? 'none' : '2px solid #E2E8F0', background: data.weakSubjects.includes(s) ? '#EF4444' : '#FFFFFF', color: data.weakSubjects.includes(s) ? '#FFFFFF' : '#64748B', fontWeight: data.weakSubjects.includes(s) ? 'bold' : '500', cursor: 'pointer', fontSize: '13px' }}>
                {data.weakSubjects.includes(s) && '✗ '}{s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>Daily Study Hours</label>
          <select value={data.studyHours} onChange={(e) => update('studyHours', e.target.value)} style={{ width: '100%', padding: '14px 16px', border: '2px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', outline: 'none', background: '#FFFFFF', cursor: 'pointer', boxSizing: 'border-box' }}>
            {['1-2 hours', '2-4 hours', '4-6 hours', '6+ hours'].map(h => <option key={h}>{h}</option>)}
          </select>
        </div>

        <button onClick={submit} style={{ marginTop: '16px', width: '100%', padding: '18px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #0D1B4B, #0D9488)', color: '#FFFFFF', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          🚀 Let's Go!
        </button>
      </div>
    </div>
  );
};

const TeacherProfileSetup = ({ onComplete }) => {
  const [data, setData] = useState({
    name: '',
    schoolName: '',
    subjectsTaught: [],
    classesHandled: []
  });

  const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  const toggle = (list, item) => {
    setData(prev => ({
      ...prev,
      [list]: prev[list].includes(item) ? prev[list].filter(x => x !== item) : [...prev[list], item]
    }));
  };

  const submit = () => {
    if (!data.name.trim()) return alert("Please enter your name");
    onComplete({ ...data, role: 'teacher' });
  };

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '560px', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', margin: 'auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '64px', height: '64px', background: '#0D1B4B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px', color: '#fff' }}>👩‍🏫</div>
        <h2 style={{ color: '#0D1B4B', margin: '0 0 8px', fontSize: '28px', fontWeight: 'bold' }}>Teacher Profile</h2>
        <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Configure your dashboard</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>Full Name *</label>
          <input type="text" value={data.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Mrs. Sharma" style={{ width: '100%', padding: '14px 16px', border: '2px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}/>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>School / Institute Name</label>
          <input type="text" value={data.schoolName} onChange={(e) => update('schoolName', e.target.value)} placeholder="e.g. Delhi Public School" style={{ width: '100%', padding: '14px 16px', border: '2px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}/>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>Subjects You Teach</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {subjectsList.map(s => (
              <button key={s} onClick={() => toggle('subjectsTaught', s)} style={{ padding: '8px 16px', borderRadius: '24px', border: data.subjectsTaught.includes(s) ? 'none' : '2px solid #E2E8F0', background: data.subjectsTaught.includes(s) ? '#0D9488' : '#FFFFFF', color: data.subjectsTaught.includes(s) ? '#FFFFFF' : '#64748B', fontWeight: data.subjectsTaught.includes(s) ? 'bold' : '500', cursor: 'pointer', fontSize: '13px' }}>
                {data.subjectsTaught.includes(s) && '✓ '}{s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>Classes You Handle</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {classList.map(c => (
              <button key={c} onClick={() => toggle('classesHandled', c)} style={{ padding: '8px 16px', borderRadius: '24px', border: data.classesHandled.includes(c) ? 'none' : '2px solid #E2E8F0', background: data.classesHandled.includes(c) ? '#0D1B4B' : '#FFFFFF', color: data.classesHandled.includes(c) ? '#FFFFFF' : '#64748B', fontWeight: data.classesHandled.includes(c) ? 'bold' : '500', cursor: 'pointer', fontSize: '13px' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <button onClick={submit} style={{ marginTop: '16px', width: '100%', padding: '18px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #0D1B4B, #0D9488)', color: '#FFFFFF', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          Enter Dashboard
        </button>
      </div>
    </div>
  );
};

const StudentProfileSetup = ({ onComplete }) => {
  const [data, setData] = useState({
    name: '',
    grade: '10th',
    board: 'CBSE',
    weakSubjects: []
  });

  const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  const toggleSubject = (subject) => {
    setData(prev => ({
      ...prev,
      weakSubjects: prev.weakSubjects.includes(subject)
        ? prev.weakSubjects.filter(s => s !== subject)
        : [...prev.weakSubjects, subject]
    }));
  };

  const submit = () => {
    if (!data.name.trim()) return alert("Please enter your name");
    onComplete({ ...data, role: 'student' });
  };

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '560px', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', margin: 'auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '64px', height: '64px', background: '#7c3aed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px', color: '#fff' }}>🎓</div>
        <h2 style={{ color: '#1E293B', margin: '0 0 8px', fontSize: '28px', fontWeight: 'bold' }}>Student Profile</h2>
        <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Join your class</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>Full Name *</label>
          <input type="text" value={data.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Aditi Raju" style={{ width: '100%', padding: '14px 16px', border: '2px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>Class</label>
            <select value={data.grade} onChange={(e) => update('grade', e.target.value)} style={{ width: '100%', padding: '14px 16px', border: '2px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', outline: 'none', background: '#FFFFFF', cursor: 'pointer', boxSizing: 'border-box' }}>
              {classList.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>Board</label>
            <select value={data.board} onChange={(e) => update('board', e.target.value)} style={{ width: '100%', padding: '14px 16px', border: '2px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', outline: 'none', background: '#FFFFFF', cursor: 'pointer', boxSizing: 'border-box' }}>
              {['CBSE', 'State Board', 'ICSE'].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>Weak Subjects</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {subjectsList.slice(0, 6).map(s => (
              <button key={s} onClick={() => toggleSubject(s)} style={{ padding: '8px 16px', borderRadius: '24px', border: data.weakSubjects.includes(s) ? 'none' : '2px solid #E2E8F0', background: data.weakSubjects.includes(s) ? '#EF4444' : '#FFFFFF', color: data.weakSubjects.includes(s) ? '#FFFFFF' : '#64748B', fontWeight: data.weakSubjects.includes(s) ? 'bold' : '500', cursor: 'pointer', fontSize: '13px' }}>
                {data.weakSubjects.includes(s) && '✗ '}{s}
              </button>
            ))}
          </div>
        </div>

        <button onClick={submit} style={{ marginTop: '16px', width: '100%', padding: '18px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#FFFFFF', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          Join Class
        </button>
      </div>
    </div>
  );
};

const ProfileSetup = ({ user, onComplete }) => {
  const [role, setRole] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleProfileComplete = async (profileData) => {
    if (!user) return;
    setSaving(true);
    try {
      await saveUserProfile(user.uid, profileData);
      onComplete(profileData);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'linear-gradient(135deg, #0D1B4B, #0D9488)' }}>
      {saving && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, color: 'white', fontSize: '24px' }}>
          Saving Profile...
        </div>
      )}
      
      {!role && (
        <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '900px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '28px', color: '#0D1B4B', marginBottom: '32px' }}>Choose Your Role</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div onClick={() => handleRoleSelection('aspirant')} style={{ padding: '32px', textAlign: 'center', border: '2px solid #E2E8F0', borderRadius: '20px', cursor: 'pointer' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
              <h3 style={{ fontSize: '20px', color: '#1E293B', marginBottom: '8px' }}>Individual Aspirant</h3>
              <p style={{ color: '#64748B', fontSize: '14px' }}>Self-study for competitive exams</p>
            </div>
            
            <div onClick={() => handleRoleSelection('teacher')} style={{ padding: '32px', textAlign: 'center', border: '2px solid #E2E8F0', borderRadius: '20px', cursor: 'pointer' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👩‍🏫</div>
              <h3 style={{ fontSize: '20px', color: '#1E293B', marginBottom: '8px' }}>Teacher</h3>
              <p style={{ color: '#64748B', fontSize: '14px' }}>Create classes & monitor students</p>
            </div>

            <div onClick={() => handleRoleSelection('student')} style={{ padding: '32px', textAlign: 'center', border: '2px solid #E2E8F0', borderRadius: '20px', cursor: 'pointer' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</div>
              <h3 style={{ fontSize: '20px', color: '#1E293B', marginBottom: '8px' }}>Classured Student</h3>
              <p style={{ color: '#64748B', fontSize: '14px' }}>Join a teacher's class</p>
            </div>
          </div>
        </div>
      )}

      {role === 'aspirant' && <AspirantProfileSetup onComplete={handleProfileComplete} />}
      {role === 'teacher' && <TeacherProfileSetup onComplete={handleProfileComplete} />}
      {role === 'student' && <StudentProfileSetup onComplete={handleProfileComplete} />}
      
    </div>
  );
}

export default ProfileSetup;
