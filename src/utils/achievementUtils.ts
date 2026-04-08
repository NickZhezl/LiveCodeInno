// Achievement utilities - can be called from anywhere
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../main";
import { ACHIEVEMENTS, Achievement, checkAchievements } from "../data/achievements";

export interface UserAchievementStats {
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

// Check and unlock achievements based on current stats
export async function checkAndUnlockAchievements(
  userId: string,
  stats: UserAchievementStats
): Promise<string[]> {
  const newlyUnlocked: string[] = [];
  
  try {
    // Get currently unlocked achievements
    const achievementsRef = doc(firestore, "users", userId, "achievements", "unlocked");
    const achievementsSnap = await getDoc(achievementsRef);
    const currentlyUnlocked = achievementsSnap.exists() 
      ? (achievementsSnap.data().achievementIds || []) 
      : [];

    // Check which achievements should be unlocked
    const achievementsToUnlock = checkAchievements(stats);
    
    for (const achievement of achievementsToUnlock) {
      if (achievement.unlocked && !currentlyUnlocked.includes(achievement.id)) {
        // Unlock this achievement
        newlyUnlocked.push(achievement.id);
      }
    }

    if (newlyUnlocked.length > 0) {
      const newUnlocked = [...currentlyUnlocked, ...newlyUnlocked];
      await setDoc(achievementsRef, {
        achievementIds: newUnlocked,
        updatedAt: new Date(),
      }, { merge: true });
    }

    return newlyUnlocked;
  } catch (error) {
    console.error("Error checking achievements:", error);
    return [];
  }
}

// Unlock a specific achievement
export async function unlockSpecificAchievement(
  userId: string,
  achievementId: string
): Promise<boolean> {
  try {
    const achievementsRef = doc(firestore, "users", userId, "achievements", "unlocked");
    const achievementsSnap = await getDoc(achievementsRef);
    const currentlyUnlocked = achievementsSnap.exists() 
      ? (achievementsSnap.data().achievementIds || []) 
      : [];

    if (!currentlyUnlocked.includes(achievementId)) {
      const newUnlocked = [...currentlyUnlocked, achievementId];
      await setDoc(achievementsRef, {
        achievementIds: newUnlocked,
        updatedAt: new Date(),
      }, { merge: true });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error unlocking achievement:", error);
    return false;
  }
}

// Get achievement info by ID
export function getAchievementInfo(achievementId: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === achievementId);
}
