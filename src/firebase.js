import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  increment,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBEJm0k8-Geo8SkUiNYgAwpd0hIfRNgv-Y",
  authDomain: "edumirror-pro.firebaseapp.com",
  projectId: "edumirror-pro",
  storageBucket: "edumirror-pro.firebasestorage.app",
  messagingSenderId: "271505589814",
  appId: "1:271505589814:web:f68ad29c959d72c2f0ba97"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ── USER FUNCTIONS ──────────────────────

// Create or update user profile
export const saveUserProfile = async (uid, data) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        ...data,
        testsCount: 0,
        avgScore: 0,
        studyStreak: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        lastActiveDate: '',
        totalXP: 0,
        coins: 0,
        badges: [],
        completedChallenges: [],
        challengeDate: '',
        highScoreCount: 0,
        cleanTests: 0,
        consecutivePerfect: 0,
        bigImprovement: false,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
    } else {
      await updateDoc(userRef, {
        ...data,
        lastUpdated: serverTimestamp()
      });
    }
  } catch (err) {
    console.error('saveUserProfile error:', err);
    throw err;
  }
};

// Get user profile
export const getUserProfile = async (uid) => {
  try {
    const userSnap = await getDoc(
      doc(db, 'users', uid)
    );
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (err) {
    console.error('getUserProfile error:', err);
    throw err;
  }
};

// Update study streak
export const updateStudyStreak = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    
    const today = new Date()
      .toISOString().split('T')[0];
    const lastActive = userData.lastActiveDate || '';
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday
      .toISOString().split('T')[0];
    
    let newStreak = userData.studyStreak || 0;
    
    if (lastActive === today) {
      return newStreak;
    } else if (lastActive === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
    
    await updateDoc(userRef, {
      studyStreak: newStreak,
      lastActiveDate: today,
      lastUpdated: serverTimestamp()
    });
    
    return newStreak;
  } catch (err) {
    console.error('updateStreak error:', err);
    return 0;
  }
};

// ── TEST FUNCTIONS ──────────────────────

// Save test result
export const saveTestResult = async (
  uid, userName, userEmail, results, classId = null
) => {
  try {
    // Calculate weak concepts
    const weakConcepts = Object.entries(
      results.conceptScores || {}
    )
      .filter(([, data]) => 
        (data.total > 0 && data.correct / data.total < 0.5)
      )
      .map(([concept]) => concept);

    // Save test document
    const testRef = await addDoc(
      collection(db, 'tests'), {
      userId: uid,
      userName: userName,
      userEmail: userEmail,
      subject: results.config?.subject || '',
      topic: results.config?.chapter || '',
      examType: results.config?.examType || '',
      score: results.correct,
      total: results.total,
      percentage: results.percentage,
      timeTaken: results.timeTaken || 0,
      tabSwitches: results.tabSwitches || 0,
      conceptScores: results.conceptScores || {},
      weakConcepts: weakConcepts,
      questions: results.questions || [],
      answers: results.answers || {},
      classId: classId,
      createdAt: serverTimestamp()
    });

    // Update user stats
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    
    const oldCount = userData.testsCount || 0;
    const oldAvg = userData.avgScore || 0;
    const newCount = oldCount + 1;
    const newAvg = Math.round(
      (oldAvg * oldCount + results.percentage) / newCount
    );

    await updateDoc(userRef, {
      testsCount: increment(1),
      avgScore: newAvg,
      totalQuestions: increment(results.total),
      totalCorrect: increment(results.correct),
      lastUpdated: serverTimestamp()
    });

    // Save wrong answers as mistakes
    const wrongQuestions = (results.questions || [])
      .filter(q => {
        const ans = results.answers[q.id];
        return ans && ans !== q.correct;
      });

    for (const q of wrongQuestions) {
      await addDoc(collection(db, 'mistakes'), {
        userId: uid,
        question: q.question,
        options: q.options,
        wrongAnswer: results.answers[q.id],
        correctAnswer: q.correct,
        explanation: q.explanation || '',
        concept: q.concept || '',
        subject: results.config?.subject || '',
        examType: results.config?.examType || '',
        reviewed: false,
        createdAt: serverTimestamp()
      });
    }

    // Update streak
    await updateStudyStreak(uid);

    return testRef.id;
  } catch (err) {
    console.error('saveTestResult error:', err);
    throw err;
  }
};

// Get all tests for a user
export const getUserTests = async (uid) => {
  try {
    const q = query(
      collection(db, 'tests'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate()
        ?.toLocaleDateString() || 'Today'
    }));
  } catch (err) {
    console.error('getUserTests error:', err);
    return [];
  }
};

// Get user mistakes
export const getUserMistakes = async (uid) => {
  try {
    const q = query(
      collection(db, 'mistakes'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate()
        ?.toLocaleDateString() || 'Today'
    }));
  } catch (err) {
    console.error('getUserMistakes error:', err);
    return [];
  }
};

// Wrapper for both tests and mistakes
export const loadDashboardData = async (uid) => {
  const [tests, mistakes] = await Promise.all([
    getUserTests(uid),
    getUserMistakes(uid)
  ]);
  return { tests, mistakes };
};

// ── CLASS FUNCTIONS ──────────────────────

// Create class (teacher)
export const createClass = async (
  teacherId, teacherName, classData
) => {
  try {
    const code = Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase();

    const classRef = await addDoc(
      collection(db, 'classes'), {
      teacherId,
      teacherName,
      className: classData.name,
      subject: classData.subject,
      classCode: code,
      students: [],
      testsCount: 0,
      createdAt: serverTimestamp()
    });

    return { id: classRef.id, code };
  } catch (err) {
    console.error('createClass error:', err);
    throw err;
  }
};

// Get teacher classes
export const getTeacherClasses = async (teacherId) => {
  try {
    const q = query(
      collection(db, 'classes'),
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  } catch (err) {
    console.error('getTeacherClasses error:', err);
    return [];
  }
};

// Student joins class
export const joinClass = async (
  code, studentId, studentName, studentEmail
) => {
  try {
    const q = query(
      collection(db, 'classes'),
      where('classCode', '==', code.toUpperCase())
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error(
        'Class not found! Check the code.'
      );
    }

    const classDoc = snap.docs[0];
    const classData = {
      id: classDoc.id,
      ...classDoc.data()
    };

    // Check if already joined
    const alreadyJoined = classData.students
      .some(s => s.uid === studentId);
    if (alreadyJoined) {
      return classData;
    }

    await updateDoc(
      doc(db, 'classes', classDoc.id), {
      students: arrayUnion({
        uid: studentId,
        name: studentName,
        email: studentEmail || '',
        joinedAt: new Date().toISOString()
      })
    });

    return { id: classDoc.id, ...classData };
  } catch (err) {
    console.error('joinClass error:', err);
    throw err;
  }
};

// Get student classes
export const getStudentClasses = async (studentId) => {
  try {
    const allClassesSnap = await getDocs(
      collection(db, 'classes')
    );
    const myClasses = allClassesSnap.docs
      .filter(d => 
        (d.data().students || []).some(
          s => s.uid === studentId
        )
      )
      .map(d => ({ id: d.id, ...d.data() }));
    return myClasses;
  } catch (err) {
    console.error('getStudentClasses error:', err);
    return [];
  }
};

// Get class test results (for teacher)
export const getClassResults = async (classId) => {
  try {
    const q = query(
      collection(db, 'tests'),
      where('classId', '==', classId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate()
        ?.toLocaleDateString() || 'Today'
    }));
  } catch (err) {
    console.error('getClassResults error:', err);
    return [];
  }
};

// ── GAMIFICATION FUNCTIONS ────────────────

import { BADGES } from './utils/gamification';

export const checkAndAwardBadges = async (uid, stats) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return [];
    const earned = userDoc.data().badges || [];
    const newBadges = [];

    BADGES.forEach(badge => {
      if (!earned.includes(badge.id) && badge.condition(stats)) {
        newBadges.push(badge.id);
      }
    });

    if (newBadges.length > 0) {
      await updateDoc(doc(db, 'users', uid), {
        badges: arrayUnion(...newBadges)
      });
    }

    return newBadges;
  } catch (err) {
    console.error('checkAndAwardBadges error:', err);
    return [];
  }
};

export const updateDailyChallenges = async (uid, results) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return;
    const userData = userDoc.data();
    
    const today = new Date().toDateString();
    let completed = userData.completedChallenges || [];
    
    // Reset challenges if it's a new day
    if (userData.challengeDate !== today) {
      completed = [];
    }

    // Since we don't have the exact profile here to re-generate the challenges, 
    // we'll just check against the hardcoded conditions:
    const newlyCompleted = [];
    
    if (!completed.includes('daily_test') && results.total > 0) {
      newlyCompleted.push('daily_test');
    }
    if (!completed.includes('accuracy_master') && results.percentage >= 80) {
      newlyCompleted.push('accuracy_master');
    }
    if (!completed.includes('question_blitz') && results.correct >= 20) {
      newlyCompleted.push('question_blitz');
    }
    if (!completed.includes('speed_run') && results.total >= 10 && results.timeTaken < 600) {
      newlyCompleted.push('speed_run');
    }
    if (!completed.includes('perfect_test') && results.percentage === 100) {
      newlyCompleted.push('perfect_test');
    }
    // Note: review_mistakes and weak_area require extra context so omitted or done generically

    if (newlyCompleted.length > 0) {
      await updateDoc(userRef, {
        completedChallenges: arrayUnion(...newlyCompleted),
        challengeDate: today
      });
      console.log('Completed challenges:', newlyCompleted);
    }
  } catch (err) {
    console.error('updateDailyChallenges error:', err);
  }
};

export const loadLeaderboard = async () => {
  try {
    const q = query(
      collection(db, 'users'),
      orderBy('totalXP', 'desc')
    );
    // Note: Can't easily order by default if index missing, so let's just fetch and map
    const snap = await getDocs(q);
    return snap.docs.map((d, i) => ({
      rank: i + 1,
      id: d.id,
      ...d.data()
    }));
  } catch (err) {
    console.error('loadLeaderboard error:', err);
    return [];
  }
};

