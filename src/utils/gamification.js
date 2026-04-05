export const XP_REWARDS = {
  testCompleted: 50,
  correctAnswer: 10,
  perfectScore: 200,
  dailyLogin: 25,
  streakBonus: 15,
  firstTestOfDay: 75,
  mistakeReviewed: 20,
  studyPlanViewed: 10,
  doubtAsked: 15,
  shareResult: 30
};

export const calculateXP = (results) => {
  let xp = XP_REWARDS.testCompleted;
  xp += results.correct * XP_REWARDS.correctAnswer;
  if (results.percentage === 100) 
    xp += XP_REWARDS.perfectScore;
  if (results.tabSwitches === 0) xp += 25;
  return xp;
};

export const LEVELS = [
  { level: 1,  name: 'Beginner',     xpRequired: 0,     icon: '🌱', color: '#94A3B8' },
  { level: 2,  name: 'Explorer',     xpRequired: 500,   icon: '🔍', color: '#60A5FA' },
  { level: 3,  name: 'Scholar',      xpRequired: 1500,  icon: '📚', color: '#34D399' },
  { level: 4,  name: 'Achiever',     xpRequired: 3000,  icon: '⭐', color: '#FBBF24' },
  { level: 5,  name: 'Expert',       xpRequired: 6000,  icon: '🎯', color: '#F97316' },
  { level: 6,  name: 'Master',       xpRequired: 10000, icon: '🏆', color: '#EF4444' },
  { level: 7,  name: 'Champion',     xpRequired: 15000, icon: '👑', color: '#8B5CF6' },
  { level: 8,  name: 'Legend',       xpRequired: 25000, icon: '🌟', color: '#EC4899' },
  { level: 9,  name: 'Grandmaster',  xpRequired: 40000, icon: '💎', color: '#0D9488' },
  { level: 10, name: 'EduMirror Pro',xpRequired: 60000, icon: '🚀', color: '#0D1B4B' }
];

export const getCurrentLevel = (totalXP) => {
  if (!totalXP) totalXP = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xpRequired) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
};

export const getNextLevel = (totalXP) => {
  if (!totalXP) totalXP = 0;
  const current = getCurrentLevel(totalXP);
  const nextIdx = LEVELS.findIndex(
    l => l.level === current.level
  ) + 1;
  return LEVELS[nextIdx] || null;
};

export const getLevelProgress = (totalXP) => {
  if (!totalXP) totalXP = 0;
  const current = getCurrentLevel(totalXP);
  const next = getNextLevel(totalXP);
  if (!next) return 100;
  const range = next.xpRequired - current.xpRequired;
  const earned = totalXP - current.xpRequired;
  return Math.round((earned / Math.max(1, range)) * 100);
};

export const BADGES = [
  // Test badges
  { id: 'first_test', name: 'First Step',
    desc: 'Complete your first test',
    icon: '🎯', color: '#10B981',
    condition: (stats) => stats.testsCount >= 1 },
  { id: 'test_5', name: 'Getting Started',
    desc: 'Complete 5 tests',
    icon: '📝', color: '#3B82F6',
    condition: (stats) => stats.testsCount >= 5 },
  { id: 'test_25', name: 'Dedicated Learner',
    desc: 'Complete 25 tests',
    icon: '💪', color: '#8B5CF6',
    condition: (stats) => stats.testsCount >= 25 },
  { id: 'test_100', name: 'Century Club',
    desc: 'Complete 100 tests',
    icon: '💯', color: '#F59E0B',
    condition: (stats) => stats.testsCount >= 100 },

  // Score badges
  { id: 'perfect_score', name: 'Perfectionist',
    desc: 'Score 100% on a test',
    icon: '⭐', color: '#FBBF24',
    condition: (stats) => stats.hasPerfectScore },
  { id: 'high_scorer', name: 'High Achiever',
    desc: 'Score 90%+ on 5 tests',
    icon: '🏆', color: '#F97316',
    condition: (stats) => stats.highScoreCount >= 5 },
  { id: 'above_average', name: 'Above Average',
    desc: 'Maintain 75%+ average',
    icon: '📈', color: '#10B981',
    condition: (stats) => stats.avgScore >= 75 },

  // Streak badges
  { id: 'streak_3', name: 'On a Roll',
    desc: '3-day study streak',
    icon: '🔥', color: '#EF4444',
    condition: (stats) => stats.studyStreak >= 3 },
  { id: 'streak_7', name: 'Week Warrior',
    desc: '7-day study streak',
    icon: '⚡', color: '#F59E0B',
    condition: (stats) => stats.studyStreak >= 7 },
  { id: 'streak_30', name: 'Monthly Master',
    desc: '30-day study streak',
    icon: '🌟', color: '#8B5CF6',
    condition: (stats) => stats.studyStreak >= 30 },
  { id: 'streak_100', name: 'Unstoppable',
    desc: '100-day study streak',
    icon: '👑', color: '#EC4899',
    condition: (stats) => stats.studyStreak >= 100 },

  // XP badges
  { id: 'xp_1000', name: 'XP Hunter',
    desc: 'Earn 1,000 XP',
    icon: '💫', color: '#0D9488',
    condition: (stats) => stats.totalXP >= 1000 },
  { id: 'xp_10000', name: 'XP Legend',
    desc: 'Earn 10,000 XP',
    icon: '💎', color: '#7C3AED',
    condition: (stats) => stats.totalXP >= 10000 },

  // Special badges
  { id: 'no_cheat', name: 'Honest Scholar',
    desc: 'Complete 10 tests with 0 tab switches',
    icon: '🛡️', color: '#0D1B4B',
    condition: (stats) => stats.cleanTests >= 10 },
  { id: 'speed_demon', name: 'Speed Demon',
    desc: 'Complete a test in under 5 minutes',
    icon: '⚡', color: '#EF4444',
    condition: (stats) => stats.fastTest },
  { id: 'comeback_kid', name: 'Comeback Kid',
    desc: 'Improve score by 30% from previous test',
    icon: '↗️', color: '#10B981',
    condition: (stats) => stats.bigImprovement },
  { id: 'zero_mistakes', name: 'Flawless',
    desc: 'Score 100% 3 times in a row',
    icon: '✨', color: '#FBBF24',
    condition: (stats) => stats.consecutivePerfect >= 3 },
];

export const generateDailyChallenges = (profile) => {
  const today = new Date().toDateString();
  const seed = today.length + (profile?.examType?.length || 0);
  
  const allChallenges = [
    { id: 'daily_test', title: 'Daily Test', desc: 'Complete 1 test today', xp: 100, icon: '📝', type: 'test', target: 1 },
    { id: 'accuracy_master', title: 'Accuracy Master', desc: 'Score 80%+ on any test', xp: 150, icon: '🎯', type: 'score', target: 80 },
    { id: 'question_blitz', title: 'Question Blitz', desc: 'Answer 20 questions correctly', xp: 200, icon: '⚡', type: 'correct', target: 20 },
    { id: 'speed_run', title: 'Speed Run', desc: 'Finish a 10-question test under 10 minutes', xp: 175, icon: '🏃', type: 'speed', target: 600 },
    { id: 'perfect_test', title: 'Perfectionist', desc: 'Score 100% on any test', xp: 300, icon: '⭐', type: 'perfect', target: 100 },
    { id: 'review_mistakes', title: 'Learn from Mistakes', desc: 'Review 5 mistakes in journal', xp: 75, icon: '📖', type: 'review', target: 5 },
    { id: 'weak_area', title: 'Face Your Fear', desc: 'Take a test on your weakest subject', xp: 200, icon: '💪', type: 'weak', target: 1 }
  ];

  const idx = seed % allChallenges.length;
  return [
    allChallenges[idx % allChallenges.length],
    allChallenges[(idx + 2) % allChallenges.length],
    allChallenges[(idx + 4) % allChallenges.length]
  ];
};

export const REWARD_SHOP = [
  { id: 'hint', name: 'Hint Token', desc: 'Remove 1 wrong answer in test', cost: 50, icon: '💡', quantity: true },
  { id: 'xp_boost', name: 'XP Boost', desc: '2x XP for next test', cost: 100, icon: '⚡', quantity: true },
  { id: 'time_bonus', name: 'Time Bonus', desc: '+5 minutes added to next test', cost: 75, icon: '⏰', quantity: true },
  { id: 'skip_question', name: 'Skip Pass', desc: 'Skip 1 question without penalty', cost: 80, icon: '⏭️', quantity: true },
  { id: 'streak_shield', name: 'Streak Shield', desc: 'Protect streak if you miss a day', cost: 200, icon: '🛡️', quantity: true },
];
