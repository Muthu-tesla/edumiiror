import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

import LoginPage from "./pages/LoginPage";
import ProfileSetup from "./pages/ProfileSetup";
import ProfilePage from "./pages/ProfilePage";

import AspirantHome from "./pages/aspirant/AspirantHome";
import SyllabusInput from "./pages/aspirant/SyllabusInput";
import MistakeJournal from "./pages/aspirant/MistakeJournal";
import StudyPlan from "./pages/aspirant/StudyPlan";

import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import CreateTest from "./pages/teacher/CreateTest";
import LiveMonitor from "./pages/teacher/LiveMonitor";

import StudentHome from "./pages/student/StudentHome";

import GamifiedNavbar from "./components/GamifiedNavbar";
import BottomNav from "./components/BottomNav";
import Leaderboard from "./pages/aspirant/Leaderboard";
import BadgesPage from "./pages/aspirant/BadgesPage";

const App = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('login');
  const [testConfig, setTestConfig] = useState(null);

  // Data state passed between pages
  const [dashboardData, setDashboardData] = useState({ tests: [], mistakes: [] });

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const profile = userDoc.data();
            setUserProfile(profile);
            if (profile.role === 'aspirant') setCurrentPage('aspirantHome');
            else if (profile.role === 'teacher') setCurrentPage('teacherDashboard');
            else if (profile.role === 'student') setCurrentPage('studentHome');
          } else {
            setCurrentPage('profileSetup');
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setCurrentPage('profileSetup');
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setCurrentPage('login');
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (firebaseUser, isNew, profile) => {
    setUser(firebaseUser);
    if (isNew) {
      setCurrentPage('profileSetup');
    } else if (profile) {
      setUserProfile(profile);
      if (profile.role === 'aspirant') setCurrentPage('aspirantHome');
      else if (profile.role === 'teacher') setCurrentPage('teacherDashboard');
      else if (profile.role === 'student') setCurrentPage('studentHome');
    }
  };

  const handleProfileComplete = (profileData) => {
    setUserProfile(profileData);
    if (profileData.role === 'aspirant') setCurrentPage('aspirantHome');
    else if (profileData.role === 'teacher') setCurrentPage('teacherDashboard');
    else if (profileData.role === 'student') setCurrentPage('studentHome');
  };

  const goHome = () => {
    if (!userProfile) return;
    if (userProfile.role === 'aspirant') setCurrentPage('aspirantHome');
    else if (userProfile.role === 'teacher') setCurrentPage('teacherDashboard');
    else if (userProfile.role === 'student') setCurrentPage('studentHome');
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setTestConfig(null);
    setDashboardData({ tests: [], mistakes: [] });
    setCurrentPage('login');
  };

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0D1B4B'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px', animation: 'pulse 2s infinite' }}>📚</div>
          <p style={{ color: '#0D9488', fontSize: '20px', fontWeight: '700', margin: 0 }}>
            Loading EduMirror Pro...
          </p>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '8px' }}>
            Your AI-powered study companion
          </p>
        </div>
      </div>
    );
  }

  const showNavbar = !['login', 'profileSetup', 'liveMonitor'].includes(currentPage);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F1F5F9; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
      `}</style>

      {showNavbar && (
        <GamifiedNavbar 
          userProfile={userProfile} 
          user={user} 
          onLogout={handleLogout} 
          onHome={goHome} 
        />
      )}

      <div style={{ flex: 1 }}>
        {currentPage === 'login' && <LoginPage onLogin={handleLogin} />}

        {currentPage === 'profileSetup' && (
          <ProfileSetup user={user} onComplete={handleProfileComplete} />
        )}

        {currentPage === 'profilePage' && (
          <ProfilePage profile={userProfile} onBack={goHome} />
        )}

        {/* ── ASPIRANT FLOW ── */}
        {currentPage === 'aspirantHome' && (
          <AspirantHome
            user={user}
            profile={userProfile}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
            onStartTest={() => setCurrentPage('aspirantTest')}
            onJournal={() => setCurrentPage('mistakeJournal')}
            onStudyPlan={() => setCurrentPage('studyPlan')}
            onDashboardData={setDashboardData}
          />
        )}

        {currentPage === 'leaderboard' && (
          <Leaderboard currentUserId={user?.uid} />
        )}

        {currentPage === 'badges' && (
          <BadgesPage profile={userProfile} />
        )}

        {currentPage === 'aspirantTest' && (
          <SyllabusInput
            user={user}
            profile={userProfile}
            onStart={(config) => {
              setTestConfig({ ...config, role: 'aspirant' });
              setCurrentPage('liveMonitor');
            }}
            onBack={() => setCurrentPage('aspirantHome')}
          />
        )}

        {currentPage === 'mistakeJournal' && (
          <MistakeJournal
            user={user}
            profile={userProfile}
            onBack={() => setCurrentPage('aspirantHome')}
            onStartTest={(concept) => {
              setTestConfig({
                role: 'aspirant',
                subject: 'General',
                chapter: concept,
                examType: userProfile?.examType || 'JEE Main',
                difficulty: 'Medium',
                count: 10,
              });
              setCurrentPage('aspirantTest');
            }}
          />
        )}

        {currentPage === 'studyPlan' && (
          <StudyPlan
            user={user}
            profile={userProfile}
            tests={dashboardData.tests}
            journal={dashboardData.mistakes}
            onBack={() => setCurrentPage('aspirantHome')}
          />
        )}

        {/* ── TEACHER FLOW ── */}
        {currentPage === 'teacherDashboard' && (
          <TeacherDashboard
            user={user}
            profile={userProfile}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
            onCreateTest={() => setCurrentPage('createTest')}
          />
        )}

        {currentPage === 'createTest' && (
          <CreateTest
            user={user}
            profile={userProfile}
            onBack={() => setCurrentPage('teacherDashboard')}
            onMonitor={(config) => {
              setTestConfig({ ...config, role: 'teacher' });
              setCurrentPage('liveMonitor');
            }}
          />
        )}

        {/* ── STUDENT FLOW ── */}
        {currentPage === 'studentHome' && (
          <StudentHome
            user={user}
            profile={userProfile}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
            onTakeTest={() => {
              setTestConfig({ role: 'student', examType: userProfile?.board || 'CBSE' });
              setCurrentPage('liveMonitor');
            }}
          />
        )}

        {/* ── SHARED: LIVE TEST ── */}
        {currentPage === 'liveMonitor' && (
          <LiveMonitor
            config={testConfig}
            profile={userProfile}
            user={user}
            onEnd={goHome}
            onJournal={() => setCurrentPage('mistakeJournal')}
          />
        )}
      </div>

      {showNavbar && userProfile?.role !== 'teacher' && (
        <BottomNav 
          currentPage={currentPage}
          onNavigate={(page) => {
            if (page === 'home') goHome();
            else setCurrentPage(page);
          }}
        />
      )}
    </div>
  );
};

// Small NavButton helper
function NavBtn({ label, onClick, active }) {
  return (
    <button onClick={onClick} style={{
      background: active ? 'rgba(13,148,136,0.2)' : 'transparent',
      border: active ? '1px solid rgba(13,148,136,0.4)' : '1px solid transparent',
      borderRadius: '8px', padding: '7px 12px', color: active ? '#5EEAD4' : '#94A3B8',
      cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s'
    }}>
      {label}
    </button>
  );
}

export default App;
