import { useState } from "react";
import { BookOpen, Loader } from "lucide-react";
import { EXAM_TYPES, DIFFICULTIES, Q_COUNTS } from "../../data/mockData";
import { generateQuestions } from "../../api/gpt4o";
import { toast } from "../../components/Toast";
import SyllabusUploader from "../../components/SyllabusUploader";
import ChatBot from "../../components/ChatBot";

const EXAM_SUBJECTS = {
  'JEE': [
    'Mathematics',
    'Physics', 
    'Chemistry',
    'Physical Chemistry',
    'Organic Chemistry',
    'Inorganic Chemistry',
    'Algebra',
    'Calculus',
    'Trigonometry',
    'Coordinate Geometry',
    'Mechanics',
    'Thermodynamics',
    'Electromagnetism',
    'Optics',
    'Modern Physics'
  ],
  'NEET': [
    'Biology',
    'Botany',
    'Zoology',
    'Physics',
    'Chemistry',
    'Physical Chemistry',
    'Organic Chemistry',
    'Inorganic Chemistry',
    'Human Physiology',
    'Genetics & Evolution',
    'Cell Biology',
    'Ecology',
    'Plant Physiology',
    'Biochemistry',
    'Biotechnology'
  ],
  'UPSC': [
    'History',
    'Ancient History',
    'Medieval History',
    'Modern History',
    'Geography',
    'Indian Polity',
    'Economics',
    'Science & Technology',
    'Environment & Ecology',
    'Current Affairs',
    'Art & Culture',
    'International Relations',
    'Internal Security',
    'Disaster Management',
    'Ethics & Integrity'
  ],
  'GATE': [
    'Engineering Mathematics',
    'Computer Science',
    'Data Structures',
    'Algorithms',
    'Operating Systems',
    'Database Management',
    'Computer Networks',
    'Theory of Computation',
    'Compiler Design',
    'Digital Logic',
    'Computer Organization',
    'Software Engineering'
  ],
  'CAT': [
    'Quantitative Aptitude',
    'Verbal Ability',
    'Reading Comprehension',
    'Logical Reasoning',
    'Data Interpretation',
    'Number Systems',
    'Algebra',
    'Geometry',
    'Arithmetic',
    'Verbal Reasoning',
    'Critical Reasoning'
  ],
  'Board Exam (10th)': [
    'Mathematics',
    'Science',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Social Science',
    'History',
    'Geography',
    'Civics',
    'Economics',
    'Hindi',
    'Tamil',
    'Computer Science'
  ],
  'Board Exam (12th)': [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'English',
    'Economics',
    'Accountancy',
    'Business Studies',
    'History',
    'Political Science',
    'Geography',
    'Psychology',
    'Sociology'
  ],
  'Custom': [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'Economics',
    'Computer Science',
    'English',
    'Science',
    'Social Science',
    'Civics',
    'Accountancy',
    'Business Studies',
    'Psychology',
    'Sociology',
    'Tamil',
    'Hindi',
    'Sanskrit',
    'Physical Education'
  ]
};

const CHAPTER_SUGGESTIONS = {
  'Mathematics': [
    'Limits and Continuity',
    'Differentiation',
    'Integration',
    'Differential Equations',
    'Matrices and Determinants',
    'Probability',
    'Statistics',
    'Vectors',
    'Three Dimensional Geometry',
    'Complex Numbers',
    'Sequences and Series',
    'Binomial Theorem',
    'Permutations and Combinations',
    'Trigonometric Functions',
    'Inverse Trigonometry'
  ],
  'Physics': [
    'Newton\'s Laws of Motion',
    'Work Energy and Power',
    'Gravitation',
    'Rotational Motion',
    'Simple Harmonic Motion',
    'Thermodynamics',
    'Kinetic Theory of Gases',
    'Electric Charges and Fields',
    'Current Electricity',
    'Magnetic Effects of Current',
    'Electromagnetic Induction',
    'Ray Optics',
    'Wave Optics',
    'Dual Nature of Matter',
    'Atoms and Nuclei',
    'Semiconductors'
  ],
  'Chemistry': [
    'Atomic Structure',
    'Chemical Bonding',
    'States of Matter',
    'Thermodynamics',
    'Equilibrium',
    'Redox Reactions',
    'Electrochemistry',
    'Chemical Kinetics',
    'Surface Chemistry',
    'Coordination Compounds',
    'Organic Chemistry Basics',
    'Hydrocarbons',
    'Alcohols Phenols Ethers',
    'Aldehydes and Ketones',
    'Carboxylic Acids',
    'Amines',
    'Polymers',
    'Biomolecules'
  ],
  'Biology': [
    'Cell Biology',
    'Cell Division',
    'Biomolecules',
    'Photosynthesis',
    'Respiration',
    'Plant Growth',
    'Human Digestion',
    'Human Circulation',
    'Human Respiration',
    'Human Excretion',
    'Neural Control',
    'Endocrine System',
    'Reproduction',
    'Genetics and Heredity',
    'Molecular Basis of Inheritance',
    'Evolution',
    'Human Health and Disease',
    'Biotechnology',
    'Ecology'
  ],
  'History': [
    'Indus Valley Civilization',
    'Vedic Period',
    'Mauryan Empire',
    'Gupta Empire',
    'Medieval India',
    'Mughal Empire',
    'British East India Company',
    'Indian Revolt 1857',
    'Indian National Congress',
    'Non Cooperation Movement',
    'Civil Disobedience Movement',
    'Quit India Movement',
    'Indian Independence',
    'French Revolution',
    'World War I',
    'World War II',
    'Cold War'
  ],
  'Economics': [
    'Demand and Supply',
    'Market Equilibrium',
    'Elasticity',
    'Production and Cost',
    'Market Structures',
    'National Income',
    'Money and Banking',
    'Inflation',
    'Fiscal Policy',
    'Monetary Policy',
    'Balance of Payments',
    'International Trade',
    'Indian Economy Overview',
    'Poverty and Unemployment',
    'Economic Planning'
  ]
};

export default function SyllabusInput({ profile, user, onStart, onBack }) {
  const [tab, setTab] = useState("quick"); // 'quick' | 'syllabus'

  // Quick Test State
  const [examType,           setExamType]           = useState(profile?.examType || "JEE");
  const [subject,            setSubject]            = useState(profile?.strongSubjects?.[0] || "Physics");
  const [availableSubjects,  setAvailableSubjects]  = useState(EXAM_SUBJECTS[examType] || EXAM_SUBJECTS['Custom']);
  const [count,              setCount]              = useState(10);
  const [difficulty,         setDifficulty]         = useState(profile?.level === 'Beginner' ? "Easy" : profile?.level === 'Intermediate' ? "Medium" : "Hard");
  const [loading,            setLoading]            = useState(false);
  const [chapter,            setChapter]            = useState("");
  const [chapterError,       setChapterError]       = useState(false);

  const handleExamTypeChange = (newExamType) => {
    setExamType(newExamType);
    setSubject(EXAM_SUBJECTS[newExamType]?.[0] || "Mathematics");
    setChapter('');
    setChapterError(false);
    setAvailableSubjects(EXAM_SUBJECTS[newExamType] || EXAM_SUBJECTS['Custom']);
  };

  const handleGenerateQuick = async () => {
    if (!chapter.trim()) { 
      setChapterError(true);
      toast.warn("Please enter a topic!"); 
      return; 
    }
    setChapterError(false);
    
    setLoading(true);
    try {
      const questions = await generateQuestions({ 
        examType, 
        subject, 
        chapter: chapter.trim(), 
        count, 
        difficulty, 
        level: profile?.level || 'Intermediate' 
      });
      // Start test
      onStart({ questions, examType, subject, chapter, difficulty, numQuestions: count });
    } catch (err) {
      console.error('FULL ERROR:', err);
      // Show detailed error - NO FALLBACK TO MOCK DATA
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
      setLoading(false);
    }
  };

  const handleSyllabusGenerated = (questions, config) => {
    onStart({ questions, ...config });
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        background: 'rgba(13,27,75,0.97)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          `}
        </style>
        <div style={{
          fontSize: '56px',
          marginBottom: '24px',
          animation: 'spin 2s linear infinite'
        }}>🤖</div>
        <h2 style={{
          color: '#FFFFFF',
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '12px'
        }}>
          Generating Your Test
        </h2>
        <p style={{
          color: '#14B8A6',
          fontSize: '16px',
          marginBottom: '4px'
        }}>
          Topic: <strong>{chapter}</strong>
        </p>
        <p style={{
          color: '#94A3B8',
          fontSize: '14px',
          marginBottom: '32px'
        }}>
          GPT-4o is crafting {count} personalized {difficulty} questions...
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              width: '10px', height: '10px',
              borderRadius: '50%',
              background: '#0D9488',
              animation: `bounce 0.8s ${i*0.15}s infinite`
            }}/>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: '#F8FAFC', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '750px' }}>
        <button onClick={onBack} style={{ fontSize: '14px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '24px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          ← Back
        </button>

        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '16px', border: '1px solid #F1F5F9' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', background: 'linear-gradient(135deg,#0D9488,#14B8A6)' }}>
              <BookOpen size={22} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0D1B4B', margin: '0 0 4px 0' }}>Configure Your Test</h2>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '0' }}>GPT-4o will craft personalized questions</p>
            </div>
          </div>

          <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: '24px' }}>
            <button onClick={() => setTab("quick")} style={{ flex: 1, padding: '16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: tab === "quick" ? '#0D9488' : '#64748B', borderBottom: tab === "quick" ? '3px solid #0D9488' : '3px solid transparent' }}>
              ⚡ Quick Test
            </button>
            <button onClick={() => setTab("syllabus")} style={{ flex: 1, padding: '16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: tab === "syllabus" ? '#0D9488' : '#64748B', borderBottom: tab === "syllabus" ? '3px solid #0D9488' : '3px solid transparent' }}>
              📄 From My Syllabus
            </button>
          </div>

          {tab === "quick" ? (
            <div style={{ animation: 'fadeIn 0.4s' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Exam Type</label>
                  <select value={examType} onChange={(e) => handleExamTypeChange(e.target.value)} style={{ width: '100%', borderRadius: '12px', border: '2px solid #E2E8F0', padding: '12px', fontSize: '13px', outline: 'none', color: '#1E293B', cursor: 'pointer' }}>
                    {EXAM_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Subject</label>
                  <select value={subject} onChange={e => { setSubject(e.target.value); setChapter(''); setChapterError(false); }} style={{ width: '100%', borderRadius: '12px', border: '2px solid #E2E8F0', padding: '12px', fontSize: '13px', outline: 'none', color: '#1E293B', cursor: 'pointer' }}>
                    {availableSubjects.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Chapter / Topic *</label>
                <input
                  value={chapter}
                  onChange={e => {
                    setChapter(e.target.value);
                    if (e.target.value.trim()) setChapterError(false);
                  }}
                  placeholder="e.g. Newton's Laws of Motion"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${chapterError ? '#EF4444' : '#E2E8F0'}`,
                    borderRadius: '10px',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
                {chapterError && (
                  <p style={{ color: '#EF4444', fontSize: '12px', margin: '4px 0 0' }}>
                    ⚠️ Please enter a topic to generate questions
                  </p>
                )}
                
                {/* Quick select suggestions */}
                {CHAPTER_SUGGESTIONS[subject] && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{
                      fontSize: '12px',
                      color: '#64748B',
                      marginBottom: '8px',
                      margin: '8px 0 6px'
                    }}>
                      Quick select:
                    </p>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      maxHeight: '120px',
                      overflowY: 'auto'
                    }}>
                      {CHAPTER_SUGGESTIONS[subject].map(ch => (
                        <button
                          key={ch}
                          onClick={() => { setChapter(ch); setChapterError(false); }}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '16px',
                            border: '1.5px solid',
                            borderColor: chapter === ch ? '#0D9488' : '#E2E8F0',
                            background: chapter === ch ? '#F0FDF9' : '#FFFFFF',
                            color: chapter === ch ? '#0D9488' : '#64748B',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: 'inherit',
                            fontWeight: chapter === ch ? '600' : '400'
                          }}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Number of Questions</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {Q_COUNTS.map(n => (
                      <button key={n} onClick={() => setCount(n)} style={{ flex: 1, padding: '8px 0', borderRadius: '12px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', border: count === n ? 'none' : '2px solid #E2E8F0', color: count === n ? '#FFFFFF' : '#475569', background: count === n ? '#0D9488' : 'transparent' }}>{n}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Difficulty</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={{ width: '100%', borderRadius: '12px', border: '2px solid #E2E8F0', padding: '10px 12px', fontSize: '13px', outline: 'none', color: '#1E293B', cursor: 'pointer' }}>
                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <button onClick={handleGenerateQuick} disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '12px', fontWeight: 'bold', color: '#FFFFFF', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#94A3B8' : 'linear-gradient(135deg,#0D1B4B,#0D9488)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {loading ? <><Loader size={18} style={{ animation: 'spin 1.5s linear infinite' }}/> Generating Test...</> : "✨ Generate AI Test"}
              </button>
            </div>
          ) : (
            <div style={{ animation: 'fadeIn 0.4s' }}>
              <SyllabusUploader profile={profile} role="aspirant" onGenerated={handleSyllabusGenerated} />
            </div>
          )}

        </div>
      </div>
      <ChatBot profile={profile} user={user} />
    </div>
  );
}
