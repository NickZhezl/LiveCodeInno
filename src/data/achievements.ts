// Система достижений
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "learning" | "practice" | "social" | "streak" | "special";
  requirement: number;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Learning achievements
  {
    id: "first-topic",
    title: "Первый шаг",
    description: "Изучите первую тему",
    icon: "📚",
    category: "learning",
    requirement: 1,
    xpReward: 50,
    unlocked: false,
  },
  {
    id: "topic-master",
    title: "Мастер тем",
    description: "Изучите все 8 тем",
    icon: "🎓",
    category: "learning",
    requirement: 8,
    xpReward: 200,
    unlocked: false,
  },
  {
    id: "theory-expert",
    title: "Теоретик",
    description: "Прочитайте всю теорию",
    icon: "📖",
    category: "learning",
    requirement: 100,
    xpReward: 150,
    unlocked: false,
  },

  // Practice achievements
  {
    id: "first-problem",
    title: "Первая задача",
    description: "Решите первую задачу",
    icon: "✅",
    category: "practice",
    requirement: 1,
    xpReward: 30,
    unlocked: false,
  },
  {
    id: "problem-solver",
    title: "Решатель задач",
    description: "Решите 10 задач",
    icon: "🧩",
    category: "practice",
    requirement: 10,
    xpReward: 100,
    unlocked: false,
  },
  {
    id: "code-master",
    title: "Мастер кода",
    description: "Решите 50 задач",
    icon: "💻",
    category: "practice",
    requirement: 50,
    xpReward: 500,
    unlocked: false,
  },
  {
    id: "perfect-solution",
    title: "Идеальное решение",
    description: "Решите задачу с первой попытки",
    icon: "🎯",
    category: "practice",
    requirement: 1,
    xpReward: 75,
    unlocked: false,
  },

  // Social achievements
  {
    id: "first-friend",
    title: "Первый друг",
    description: "Добавьте первого друга",
    icon: "👥",
    category: "social",
    requirement: 1,
    xpReward: 40,
    unlocked: false,
  },
  {
    id: "social-butterfly",
    title: "Душа компании",
    description: "Добавьте 10 друзей",
    icon: "🦋",
    category: "social",
    requirement: 10,
    xpReward: 150,
    unlocked: false,
  },
  {
    id: "mentor",
    title: "Наставник",
    description: "Помогите 5 друзьям решить задачи",
    icon: "🧑‍🏫",
    category: "social",
    requirement: 5,
    xpReward: 200,
    unlocked: false,
  },

  // Streak achievements
  {
    id: "first-streak",
    title: "Начало пути",
    description: "Занимайтесь 3 дня подряд",
    icon: "🔥",
    category: "streak",
    requirement: 3,
    xpReward: 60,
    unlocked: false,
  },
  {
    id: "week-warrior",
    title: "Недельный воин",
    description: "Занимайтесь 7 дней подряд",
    icon: "⚔️",
    category: "streak",
    requirement: 7,
    xpReward: 150,
    unlocked: false,
  },
  {
    id: "monthly-master",
    title: "Месячный мастер",
    description: "Занимайтесь 30 дней подряд",
    icon: "🏆",
    category: "streak",
    requirement: 30,
    xpReward: 500,
    unlocked: false,
  },

  // Special achievements
  {
    id: "early-bird",
    title: "Ранняя пташка",
    description: "Решите задачу до 8 утра",
    icon: "🐦",
    category: "special",
    requirement: 1,
    xpReward: 50,
    unlocked: false,
  },
  {
    id: "night-owl",
    title: "Ночная сова",
    description: "Решите задачу после полуночи",
    icon: "🦉",
    category: "special",
    requirement: 1,
    xpReward: 50,
    unlocked: false,
  },
  {
    id: "speed-demon",
    title: "Демон скорости",
    description: "Решите задачу менее чем за 1 минуту",
    icon: "⚡",
    category: "special",
    requirement: 1,
    xpReward: 100,
    unlocked: false,
  },
];

// Helper functions
export function checkAchievements(
  userStats: {
    topicsCompleted: number;
    problemsSolved: number;
    friendsCount: number;
    streakDays: number;
    perfectSolutions: number;
    helpedFriends: number;
    earlyBirdSolved: boolean;
    nightOwlSolved: boolean;
    speedSolved: boolean;
  }
): Achievement[] {
  return ACHIEVEMENTS.map((achievement) => {
    let progress = 0;

    switch (achievement.category) {
      case "learning":
        if (achievement.id === "first-topic") progress = userStats.topicsCompleted;
        if (achievement.id === "topic-master") progress = userStats.topicsCompleted;
        if (achievement.id === "theory-expert") progress = userStats.topicsCompleted * 12.5; // 8 topics * 12.5 = 100
        break;
      case "practice":
        if (achievement.id === "first-problem") progress = userStats.problemsSolved;
        if (achievement.id === "problem-solver") progress = userStats.problemsSolved;
        if (achievement.id === "code-master") progress = userStats.problemsSolved;
        if (achievement.id === "perfect-solution") progress = userStats.perfectSolutions;
        break;
      case "social":
        if (achievement.id === "first-friend") progress = userStats.friendsCount;
        if (achievement.id === "social-butterfly") progress = userStats.friendsCount;
        if (achievement.id === "mentor") progress = userStats.helpedFriends;
        break;
      case "streak":
        progress = userStats.streakDays;
        break;
      case "special":
        if (achievement.id === "early-bird") progress = userStats.earlyBirdSolved ? 1 : 0;
        if (achievement.id === "night-owl") progress = userStats.nightOwlSolved ? 1 : 0;
        if (achievement.id === "speed-demon") progress = userStats.speedSolved ? 1 : 0;
        break;
    }

    return {
      ...achievement,
      unlocked: progress >= achievement.requirement,
    };
  });
}

export function calculateTotalXP(achievements: Achievement[]): number {
  return achievements
    .filter((a) => a.unlocked)
    .reduce((total, a) => total + a.xpReward, 0);
}

export function getAchievementProgress(
  achievement: Achievement,
  userStats: any
): number {
  let progress = 0;

  switch (achievement.category) {
    case "learning":
      if (achievement.id === "first-topic") progress = userStats.topicsCompleted;
      if (achievement.id === "topic-master") progress = userStats.topicsCompleted;
      break;
    case "practice":
      if (achievement.id === "first-problem") progress = userStats.problemsSolved;
      if (achievement.id === "problem-solver") progress = userStats.problemsSolved;
      if (achievement.id === "code-master") progress = userStats.problemsSolved;
      break;
    case "social":
      if (achievement.id === "first-friend") progress = userStats.friendsCount;
      if (achievement.id === "social-butterfly") progress = userStats.friendsCount;
      break;
    case "streak":
      progress = userStats.streakDays;
      break;
    case "special":
      if (achievement.id === "early-bird") progress = userStats.earlyBirdSolved ? 1 : 0;
      if (achievement.id === "night-owl") progress = userStats.nightOwlSolved ? 1 : 0;
      if (achievement.id === "speed-demon") progress = userStats.speedSolved ? 1 : 0;
      break;
  }

  return Math.min(progress / achievement.requirement, 1);
}
