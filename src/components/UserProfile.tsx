import { useState, useRef, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  useToast,
  Icon,
  Badge,
  Avatar,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  SimpleGrid,
  Card,
  CardBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Input,
  FormControl,
  FormLabel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  Tag,
} from "@chakra-ui/react";
import {
  FiEdit,
  FiCamera,
  FiTrendingUp,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiActivity,
  FiTarget,
  FiZap,
  FiBook,
  FiCode,
  FiDownload,
  FiMessageSquare,
  FiHash,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { firestore } from "../main";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { ACHIEVEMENTS } from "../data/achievements";
import { HOMEWORK_TASKS } from "../data/homeworkTasks";
import ChatInbox from "./ChatInbox";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// User stats interface
interface UserStats {
  topicsCompleted: number;
  problemsSolved: number;
  friendsCount: number;
  streakDays: number;
  perfectSolutions: number;
  helpedFriends: number;
  earlyBirdSolved: boolean;
  nightOwlSolved: boolean;
  speedSolved: boolean;
  totalXP: number;
  level: number;
  completedHomework: number;
  successRate: number;
  totalAttempts: number;
  currentStreak: number;
  longestStreak: number;
  liveCodingSessions: number;
  totalTopics: number;
  firstAttemptPasses: number;
  memberSince: Date;
  lastActive: Date;
  solvedProblems: number;
  sandboxExecutions: number;
  hasAvatar: boolean;
  hasBio: boolean;
  fastestSolveTime: number;
}

// Check if achievement should be unlocked
function isAchievementUnlocked(achievementId: string, stats: UserStats): boolean {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return false;

  switch (achievementId) {
    case "first-topic": return stats.topicsCompleted >= 1;
    case "topic-master": return stats.topicsCompleted >= 8;
    case "first-problem": return stats.problemsSolved >= 1;
    case "problem-solver": return stats.problemsSolved >= 10;
    case "code-master": return stats.problemsSolved >= 50;
    case "first-friend": return stats.friendsCount >= 1;
    case "social-butterfly": return stats.friendsCount >= 10;
    case "first-streak": return stats.streakDays >= 3;
    case "week-warrior": return stats.streakDays >= 7;
    case "monthly-master": return stats.streakDays >= 30;
    case "early-bird": return stats.earlyBirdSolved;
    case "night-owl": return stats.nightOwlSolved;
    case "speed-demon": return stats.speedSolved;
    default: return false;
  }
}

interface UserProfileProps {
  onBack: () => void;
  viewingUserId?: string | null;
}

export default function UserProfile({ onBack, viewingUserId }: UserProfileProps) {
  const { userData: currentUserData, refreshUserData } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [displayName, setDisplayName] = useState(currentUserData?.displayName || "");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [nicknameColor, setNicknameColor] = useState("#ffffff");
  const [customTag, setCustomTag] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileRole, setProfileRole] = useState<"user" | "admin">("user");
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editNicknameColor, setEditNicknameColor] = useState("#ffffff");
  const [editCustomTag, setEditCustomTag] = useState("");

  // Determine if we're viewing our own profile or another user's
  const isViewingOwnProfile = !viewingUserId || viewingUserId === currentUserData?.uid;
  const userData = isViewingOwnProfile ? currentUserData : null;
  const isEditingOwnProfile = isViewingOwnProfile;
  const canEditTags = currentUserData?.role === "admin";
  
  // Use profile email/role if viewing another user, otherwise use current user's
  const displayEmail = profileEmail || currentUserData?.email || "";
  const displayRole = profileRole || currentUserData?.role || "user";

  // Stats state
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Achievements state
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  // Activity state
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  // Search and Chat state
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Load unread messages count
  useEffect(() => {
    if (!userData) return;
    loadUnreadMessages();
  }, [userData]);

  const loadUnreadMessages = async () => {
    if (!userData) return;

    try {
      // Find all chat rooms where user is a participant
      const chatRoomsRef = collection(firestore, "chatRooms");
      const q = query(chatRoomsRef);
      const snapshot = await getDocs(q);
      
      let totalUnread = 0;
      
      // For each room, check unread messages
      for (const roomDoc of snapshot.docs) {
        const roomData = roomDoc.data();
        if (roomData.participants?.includes(userData.uid)) {
          const messagesRef = collection(firestore, `chatRooms/${roomDoc.id}/messages`);
          // Fetch all messages and filter client-side to avoid requiring an index
          const msgSnapshot = await getDocs(messagesRef);
          const unread = msgSnapshot.docs.filter(
            (msg) => {
              const data = msg.data();
              return !data.read && data.senderId !== userData.uid;
            }
          ).length;
          totalUnread += unread;
        }
      }
      
      setUnreadMessages(totalUnread);
    } catch (error: any) {
      // Silently handle permission errors (rules not deployed yet)
      if (error.code === "permission-denied") {
        console.warn("Chat permissions not set up yet. Deploy Firestore rules.");
        setUnreadMessages(0);
      } else {
        console.error("Error loading unread messages:", error);
      }
    }
  };

  // Load user profile data
  useEffect(() => {
    const userIdToLoad = viewingUserId || currentUserData?.uid;
    if (!userIdToLoad) return;
    loadProfile(userIdToLoad);
    loadStats(userIdToLoad);
    loadRecentActivity(userIdToLoad);
    
    // Only load achievements and unread messages for current user
    if (isViewingOwnProfile) {
      loadAchievementsForCurrentUser();
      loadUnreadMessages();
    }
  }, [currentUserData, viewingUserId]);

  const loadAchievementsForCurrentUser = async () => {
    const calculatedStats = await loadStats(currentUserData?.uid || "");
    if (calculatedStats) {
      await loadAchievements(calculatedStats);
    }
  };

  const loadProfile = async (userId: string) => {
    try {
      const profileRef = doc(firestore, "users", userId);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        setDisplayName(data.displayName || "User");
        setBio(data.bio || "");
        setAvatarUrl(data.avatarUrl || "");
        setNicknameColor(data.nicknameColor || "#ffffff");
        setCustomTag(data.customTag || "");
        setProfileEmail(data.email || "");
        setProfileRole(data.role || "user");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadStats = async (userId: string) => {
    setIsLoading(true);

    try {
      // Load homework progress
      const progressRef = doc(firestore, "users", userId, "progress", "homework");
      const progressSnap = await getDoc(progressRef);
      const completedTasks: string[] = progressSnap.exists() ? progressSnap.data().completedTasks || [] : [];

      // Load all submissions
      const submissionsRef = collection(firestore, "submissions");
      const q = query(submissionsRef, where("userId", "==", userId));
      const submissionsSnap = await getDocs(q);
      const submissions = submissionsSnap.docs.map((d) => d.data());
      const passedSubmissions = submissions.filter((s) => s.passed);
      const successRate = submissions.length > 0 ? (passedSubmissions.length / submissions.length) * 100 : 0;

      // Calculate streak (simplified - would need daily tracking in production)
      const activityDates = new Set<string>();
      submissions.forEach((s) => {
        if (s.timestamp) {
          const date = s.timestamp.toDate ? s.timestamp.toDate().toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
          activityDates.add(date);
        }
      });

      // Simple streak calculation
      let currentStreak = 0;
      let longestStreak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        if (activityDates.has(dateStr)) {
          if (i === 0 || currentStreak > 0) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
          }
        } else {
          if (i > 0) break;
        }
      }

      // Calculate fastest solve time (approximate from attempts)
      let fastestSolveTime = 0;
      let firstAttemptPasses = 0;
      const taskAttempts = new Map<string, boolean>();
      submissions.forEach((s) => {
        if (!taskAttempts.has(s.taskId)) {
          taskAttempts.set(s.taskId, s.passed);
          if (s.passed) firstAttemptPasses++;
        }
      });

      // Load live coding sessions (count rooms created)
      const roomsRef = collection(firestore, "rooms");
      const roomsQ = query(roomsRef, where("createdBy", "==", userId));
      const roomsSnap = await getDocs(roomsQ);
      const liveCodingSessions = roomsSnap.size;

      // Sandbox executions (would need tracking, using submissions as proxy)
      const sandboxExecutions = submissions.length;

      // Topics completed
      const topicsCompleted = 0; // Would need topic progress tracking
      const totalTopics = 8;

      const calculatedStats: UserStats = {
        completedHomework: completedTasks.length,
        solvedProblems: firstAttemptPasses,
        problemsSolved: firstAttemptPasses,
        currentStreak,
        longestStreak,
        streakDays: currentStreak,
        liveCodingSessions,
        sandboxExecutions,
        hasAvatar: !!avatarUrl,
        hasBio: bio.length > 10,
        fastestSolveTime,
        firstAttemptPasses,
        perfectSolutions: firstAttemptPasses,
        totalAttempts: submissions.length,
        successRate,
        memberSince: currentUserData?.createdAt || new Date(),
        lastActive: submissions.length > 0 ? (submissions[0].timestamp?.toDate() || new Date()) : new Date(),
        topicsCompleted,
        totalTopics,
        friendsCount: 0, // Would need friends tracking
        helpedFriends: 0, // Would need help tracking
        earlyBirdSolved: false, // Would need time tracking
        nightOwlSolved: false, // Would need time tracking
        speedSolved: false, // Would need time tracking
        totalXP: completedTasks.length * 50 + firstAttemptPasses * 20,
        level: Math.floor((completedTasks.length * 50 + firstAttemptPasses * 20) / 500) + 1,
      };

      setStats(calculatedStats);
      return calculatedStats;
    } catch (error) {
      console.error("Error loading stats:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const loadAchievements = async (currentStats: UserStats) => {
    if (!userData) return;

    // Load unlocked achievements from Firestore
    try {
      const achievementsRef = doc(firestore, "users", userData.uid, "achievements", "unlocked");
      const achievementsSnap = await getDoc(achievementsRef);
      
      // Calculate which achievements SHOULD be unlocked based on current stats
      const shouldUnlock = ACHIEVEMENTS.filter((a) => isAchievementUnlocked(a.id, currentStats)).map((a) => a.id);
      
      let unlocked: string[] = [];

      if (achievementsSnap.exists()) {
        unlocked = achievementsSnap.data().achievementIds || [];
        
        // Add any new achievements that should be unlocked
        const newAchievements = shouldUnlock.filter(id => !unlocked.includes(id));
        if (newAchievements.length > 0) {
          unlocked = [...unlocked, ...newAchievements];
          await setDoc(achievementsRef, {
            achievementIds: unlocked,
            updatedAt: new Date(),
          }, { merge: true });
          
          // Show toast for newly unlocked achievements
          newAchievements.forEach(id => {
            const achievement = ACHIEVEMENTS.find((a) => a.id === id);
            if (achievement) {
              toast({
                title: "🏆 Достижение разблокировано!",
                description: `${achievement.icon} ${achievement.title}`,
                status: "success",
                duration: 5000,
              });
            }
          });
        }
      } else {
        // First time - save all calculated achievements
        unlocked = shouldUnlock;
        await setDoc(achievementsRef, {
          achievementIds: unlocked,
          updatedAt: new Date(),
        });
      }

      setUnlockedAchievements(unlocked);
    } catch (error) {
      console.error("Error loading achievements:", error);
    }
  };

  const loadRecentActivity = async (userId: string) => {
    setIsLoadingActivity(true);

    try {
      const submissionsRef = collection(firestore, "submissions");
      const q = query(
        submissionsRef,
        where("userId", "==", userId),
        limit(50)
      );
      const submissionsSnap = await getDocs(q);
      const activities = submissionsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Array<{ id: string; timestamp?: any }>;
      
      // Sort client-side to avoid requiring a composite index
      activities.sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return timeB - timeA;
      });
      
      setRecentActivity(activities.slice(0, 10));
    } catch (error: any) {
      if (error.code === "failed-precondition") {
        console.warn("Firestore index needed. Create index from console link in error message.");
        setRecentActivity([]);
      } else {
        console.error("Error loading activity:", error);
      }
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userData) return;

    // Convert to base64 for storage (in production, use Firebase Storage)
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setAvatarUrl(base64String);

      try {
        const profileRef = doc(firestore, "users", userData.uid);
        await updateDoc(profileRef, {
          avatarUrl: base64String,
        });
        toast({ title: "Аватар обновлен", status: "success" });
      } catch (error) {
        console.error("Error saving avatar:", error);
        toast({ title: "Ошибка сохранения", status: "error" });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!userData) return;
    setIsSaving(true);

    try {
      const profileRef = doc(firestore, "users", userData.uid);
      await updateDoc(profileRef, {
        displayName: editName || displayName,
        bio: editBio,
        nicknameColor: editNicknameColor,
        customTag: editCustomTag || customTag,
      });

      setDisplayName(editName || displayName);
      setBio(editBio);
      setNicknameColor(editNicknameColor);
      setCustomTag(editCustomTag || customTag);
      onClose();
      toast({ title: "Профиль обновлен", status: "success" });

      // Refresh user data in AuthContext to update header
      if (refreshUserData) {
        await refreshUserData();
      }

      // Check if profile complete achievement should be unlocked
      if (editBio.length > 10 && !unlockedAchievements.includes("profile-complete")) {
        await unlockAchievement("profile-complete");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: "Ошибка сохранения", status: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTag = async (userId: string, tag: string) => {
    try {
      const profileRef = doc(firestore, "users", userId);
      await updateDoc(profileRef, {
        customTag: tag,
      });
      setCustomTag(tag);
      toast({ title: "Тег обновлен", status: "success" });
    } catch (error) {
      console.error("Error saving tag:", error);
      toast({ title: "Ошибка сохранения тега", status: "error" });
    }
  };

  const unlockAchievement = async (achievementId: string) => {
    if (!userData) return;

    try {
      const achievementsRef = doc(firestore, "users", userData.uid, "achievements", "unlocked");
      const newUnlocked = [...unlockedAchievements, achievementId];
      await setDoc(achievementsRef, {
        achievementIds: newUnlocked,
        updatedAt: new Date(),
      }, { merge: true });

      setUnlockedAchievements(newUnlocked);

      const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (achievement) {
        toast({
          title: "🏆 Достижение разблокировано!",
          description: `${achievement.icon} ${achievement.title}`,
          status: "success",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error unlocking achievement:", error);
    }
  };

  const exportProgress = async () => {
    if (!userData || !stats) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(88, 28, 135); // Purple background
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("Live Code Interviewer", 20, 18);
    doc.setFontSize(14);
    doc.text("Отчет о прогрессе пользователя", 20, 28);
    doc.setFontSize(10);
    doc.text(`Дата: ${new Date().toLocaleDateString("ru-RU")}`, 20, 35);
    
    // User Info Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("Информация о пользователе", 20, 52);
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    const userInfo = [
      ["Имя:", displayName],
      ["Email:", userData.email],
      ["Роль:", userData.role === "admin" ? "Администратор" : "Пользователь"],
      ["Дата регистрации:", stats.memberSince.toLocaleDateString("ru-RU")],
      ["Последняя активность:", stats.lastActive.toLocaleDateString("ru-RU")],
    ];
    
    autoTable(doc, {
      startY: 56,
      body: userInfo,
      theme: "plain",
      styles: { fontSize: 11, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 }, 1: { cellWidth: 130 } },
      margin: { left: 20 },
    });
    
    // Statistics Section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Статистика", 20, finalY);
    
    const statsData = [
      ["Домашние задания", `${stats.completedHomework} / ${HOMEWORK_TASKS.length}`],
      ["Процент успешности", `${stats.successRate.toFixed(1)}%`],
      ["Всего попыток", stats.totalAttempts.toString()],
      ["Решено задач", stats.solvedProblems.toString()],
      ["Текущая серия", `${stats.currentStreak} дней`],
      ["Лучшая серия", `${stats.longestStreak} дней`],
      ["Live Coding сессии", stats.liveCodingSessions.toString()],
      ["Темы изучены", `${stats.topicsCompleted} / ${stats.totalTopics}`],
    ];
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [["Показатель", "Значение"]],
      body: statsData,
      theme: "striped",
      headStyles: { fillColor: [88, 28, 135], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 11, cellPadding: 5 },
      margin: { left: 20, right: 20 },
    });
    
    // Achievements Section
    const achievementsY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Достижения (${unlockedAchievements.length} / ${ACHIEVEMENTS.length})`, 20, achievementsY);
    
    const unlockedAchievementsList = ACHIEVEMENTS
      .filter(a => unlockedAchievements.includes(a.id))
      .map(a => [a.icon, a.title, a.description, a.category]);
    
    if (unlockedAchievementsList.length > 0) {
      autoTable(doc, {
        startY: achievementsY + 5,
        head: [["", "Название", "Описание", "Редкость"]],
        body: unlockedAchievementsList,
        theme: "striped",
        headStyles: { fillColor: [88, 28, 135], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 40, fontStyle: "bold" },
          2: { cellWidth: 100 },
          3: { cellWidth: 30 },
        },
        margin: { left: 20, right: 20 },
      });
    } else {
      doc.setFontSize(11);
      doc.setTextColor(120, 120, 120);
      doc.text("Пока нет разблокированных достижений", 20, achievementsY + 10);
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Live Code Interviewer - Страница ${i} из ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }
    
    // Save PDF
    doc.save(`progress-${displayName}-${new Date().toISOString().split("T")[0]}.pdf`);
    toast({ title: "Прогресс экспортирован в PDF", status: "success" });
  };

  if (!currentUserData) {
    return (
      <Box minH="100vh" bg="#0f0a19" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.400">Необходимо войти в систему</Text>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500">
      {/* Header */}
      <Box p={6} borderBottom="1px solid rgba(255,255,255,0.1)">
        <HStack justify="space-between">
          <HStack spacing={4}>
            <Button
              onClick={onBack}
              bg="rgba(255,255,255,0.1)"
              color="white"
              _hover={{ bg: "rgba(255,255,255,0.2)" }}
              size="sm"
            >
              ← Назад
            </Button>
            <Heading fontSize="2xl" color="white">
              Профиль пользователя
            </Heading>
          </HStack>
          <HStack spacing={2}>
            <Button
              leftIcon={<Icon as={FiDownload} />}
              size="sm"
              bg="rgba(255,255,255,0.1)"
              color="white"
              _hover={{ bg: "rgba(255,255,255,0.2)" }}
              onClick={exportProgress}
            >
              Экспорт прогресса
            </Button>
          </HStack>
        </HStack>
      </Box>

      <Box p={6} maxW="1200px" mx="auto">
        <Tabs colorScheme="purple" variant="enclosed">
          <TabList>
            <Tab>Профиль</Tab>
            <Tab>Статистика</Tab>
            <Tab>Достижения</Tab>
            <Tab>Активность</Tab>
            <Tab>
              <HStack>
                <Icon as={FiMessageSquare} />
                <Text>Сообщения</Text>
                {unreadMessages > 0 && (
                  <Badge colorScheme="red" borderRadius="full">
                    {unreadMessages}
                  </Badge>
                )}
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Profile Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Profile Card */}
                <Card bg="rgba(255,255,255,0.05)" borderRadius="xl">
                  <CardBody>
                    <VStack spacing={6}>
                      {/* Avatar Section */}
                      <HStack spacing={6} align="flex-start" w="full">
                        <Box position="relative">
                          <Avatar
                            size="2xl"
                            name={displayName}
                            src={avatarUrl || undefined}
                            bg="purple.600"
                          />
                          <Button
                            size="sm"
                            position="absolute"
                            bottom={0}
                            right={0}
                            borderRadius="full"
                            bg="purple.600"
                            color="white"
                            _hover={{ bg: "purple.700" }}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Icon as={FiCamera} />
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleAvatarUpload}
                          />
                        </Box>

                        <VStack align="start" flex={1} spacing={2}>
                          <HStack justify="space-between" w="full">
                            <VStack align="start" spacing={1}>
                              <HStack spacing={2}>
                                <Heading fontSize="2xl" color={nicknameColor}>
                                  {displayName}
                                </Heading>
                                {customTag && (
                                  <Badge
                                    colorScheme="purple"
                                    fontSize="sm"
                                    px={2}
                                    py={1}
                                    borderRadius="full"
                                  >
                                    <Icon as={FiHash} w={3} h={3} />
                                    {customTag}
                                  </Badge>
                                )}
                              </HStack>
                              <Text color="gray.400" fontSize="sm">
                                {displayEmail}
                              </Text>
                            </VStack>
                            <HStack spacing={2}>
                              {canEditTags && !isViewingOwnProfile && (
                                <Button
                                  leftIcon={<Icon as={FiHash} />}
                                  size="sm"
                                  bg="rgba(255,255,255,0.1)"
                                  color="white"
                                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                                  onClick={() => {
                                    const newTag = prompt("Введите новый тег для пользователя:", customTag);
                                    if (newTag !== null) {
                                      handleSaveTag(viewingUserId || "", newTag);
                                    }
                                  }}
                                >
                                  Изменить тег
                                </Button>
                              )}
                              {isEditingOwnProfile && (
                                <Button
                                  leftIcon={<Icon as={FiEdit} />}
                                  size="sm"
                                  bg="rgba(255,255,255,0.1)"
                                  color="white"
                                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                                  onClick={() => {
                                    setEditName(displayName);
                                    setEditBio(bio);
                                    setEditNicknameColor(nicknameColor);
                                    setEditCustomTag(customTag);
                                    onOpen();
                                  }}
                                >
                                  Редактировать
                                </Button>
                              )}
                            </HStack>
                          </HStack>

                          {bio && (
                            <Box
                              bg="rgba(255,255,255,0.05)"
                              p={4}
                              borderRadius="md"
                              w="full"
                            >
                              <Text color="gray.300">{bio}</Text>
                            </Box>
                          )}

                          <HStack spacing={4}>
                            <Badge colorScheme="purple">
                              {displayRole === "admin" ? "Администратор" : "Пользователь"}
                            </Badge>
                            <Text color="gray.500" fontSize="sm">
                              <Icon as={FiCalendar} mr={1} />
                              Участник с {stats?.memberSince.toLocaleDateString("ru-RU")}
                            </Text>
                          </HStack>
                        </VStack>
                      </HStack>

                      {/* Quick Stats */}
                      {stats && (
                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full">
                          <Stat>
                            <StatLabel color="gray.400">Домашние задания</StatLabel>
                            <StatNumber color="white">{stats.completedHomework}/{HOMEWORK_TASKS.length}</StatNumber>
                            <Progress
                              value={(stats.completedHomework / HOMEWORK_TASKS.length) * 100}
                              size="sm"
                              colorScheme="green"
                              borderRadius="full"
                            />
                          </Stat>
                          <Stat>
                            <StatLabel color="gray.400">Успешность</StatLabel>
                            <StatNumber color="white">{stats.successRate.toFixed(0)}%</StatNumber>
                            <Progress
                              value={stats.successRate}
                              size="sm"
                              colorScheme="blue"
                              borderRadius="full"
                            />
                          </Stat>
                          <Stat>
                            <StatLabel color="gray.400">Серия</StatLabel>
                            <StatNumber color="white">{stats.currentStreak} 🔥</StatNumber>
                            <Text color="gray.500" fontSize="xs">
                              Рекорд: {stats.longestStreak} дней
                            </Text>
                          </Stat>
                          <Stat>
                            <StatLabel color="gray.400">Достижения</StatLabel>
                            <StatNumber color="white">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</StatNumber>
                            <Progress
                              value={(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}
                              size="sm"
                              colorScheme="purple"
                              borderRadius="full"
                            />
                          </Stat>
                        </SimpleGrid>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Statistics Tab */}
            <TabPanel>
              {isLoading ? (
                <Box display="flex" justifyContent="center" py={20}>
                  <Spinner size="xl" color="purple.500" />
                </Box>
              ) : stats ? (
                <VStack spacing={6} align="stretch">
                  {/* General Stats */}
                  <Heading fontSize="xl" color="white">Общая статистика</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Card bg="rgba(255,255,255,0.05)" borderRadius="xl">
                      <CardBody>
                        <Stat>
                          <StatLabel color="gray.400">
                            <Icon as={FiCheckCircle} mr={2} />
                            Выполнено домашних заданий
                          </StatLabel>
                          <StatNumber color="white">{stats.completedHomework}</StatNumber>
                          <StatHelpText color="gray.500">
                            из {HOMEWORK_TASKS.length} доступных
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card bg="rgba(255,255,255,0.05)" borderRadius="xl">
                      <CardBody>
                        <Stat>
                          <StatLabel color="gray.400">
                            <Icon as={FiTarget} mr={2} />
                            Решено задач
                          </StatLabel>
                          <StatNumber color="white">{stats.solvedProblems}</StatNumber>
                          <StatHelpText color="gray.500">
                            с первой попытки: {stats.firstAttemptPasses}
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card bg="rgba(255,255,255,0.05)" borderRadius="xl">
                      <CardBody>
                        <Stat>
                          <StatLabel color="gray.400">
                            <Icon as={FiTrendingUp} mr={2} />
                            Процент успешности
                          </StatLabel>
                          <StatNumber color="white">{stats.successRate.toFixed(1)}%</StatNumber>
                          <StatHelpText color="gray.500">
                            {stats.totalAttempts} всего попыток
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card bg="rgba(255,255,255,0.05)" borderRadius="xl">
                      <CardBody>
                        <Stat>
                          <StatLabel color="gray.400">
                            <Icon as={FiZap} mr={2} />
                            Текущая серия
                          </StatLabel>
                          <StatNumber color="white">{stats.currentStreak} дней 🔥</StatNumber>
                          <StatHelpText color="gray.500">
                            Рекорд: {stats.longestStreak} дней
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card bg="rgba(255,255,255,0.05)" borderRadius="xl">
                      <CardBody>
                        <Stat>
                          <StatLabel color="gray.400">
                            <Icon as={FiCode} mr={2} />
                            Live Coding сессии
                          </StatLabel>
                          <StatNumber color="white">{stats.liveCodingSessions}</StatNumber>
                          <StatHelpText color="gray.500">
                            созданных комнат
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card bg="rgba(255,255,255,0.05)" borderRadius="xl">
                      <CardBody>
                        <Stat>
                          <StatLabel color="gray.400">
                            <Icon as={FiBook} mr={2} />
                            Темы изучены
                          </StatLabel>
                          <StatNumber color="white">{stats.topicsCompleted}/{stats.totalTopics}</StatNumber>
                          <Progress
                            value={(stats.topicsCompleted / stats.totalTopics) * 100}
                            size="sm"
                            colorScheme="green"
                            borderRadius="full"
                            mt={2}
                          />
                        </Stat>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {/* Activity Heatmap Placeholder */}
                  <Card bg="rgba(255,255,255,0.05)" borderRadius="xl">
                    <CardBody>
                      <Stat>
                        <StatLabel color="gray.400">
                          <Icon as={FiActivity} mr={2} />
                          Последняя активность
                        </StatLabel>
                        <StatNumber color="white" fontSize="md">
                          {stats.lastActive.toLocaleDateString("ru-RU", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                </VStack>
              ) : (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  Не удалось загрузить статистику
                </Alert>
              )}
            </TabPanel>

            {/* Achievements Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Heading fontSize="xl" color="white">
                    🏆 Достижения
                  </Heading>
                  <Badge colorScheme="purple" fontSize="md">
                    {unlockedAchievements.length} / {ACHIEVEMENTS.length}
                  </Badge>
                </HStack>

                {/* Overall Progress */}
                <Box>
                  <Text color="gray.400" mb={2}>
                    Общий прогресс: {((unlockedAchievements.length / ACHIEVEMENTS.length) * 100).toFixed(0)}%
                  </Text>
                  <Progress
                    value={(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}
                    size="md"
                    colorScheme="purple"
                    borderRadius="full"
                  />
                </Box>

                <Divider borderColor="rgba(255,255,255,0.1)" />

                {/* Achievements Grid */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {ACHIEVEMENTS.map((achievement) => {
                    const isUnlocked = unlockedAchievements.includes(achievement.id);
                    const color = "purple";

                    return (
                      <Card
                        key={achievement.id}
                        bg={isUnlocked ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)"}
                        borderRadius="xl"
                        opacity={isUnlocked ? 1 : 0.5}
                        borderLeft="4px solid"
                        borderColor={`${color}.500`}
                      >
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <HStack justify="space-between" w="full">
                              <Text fontSize="3xl">{achievement.icon}</Text>
                              {isUnlocked ? (
                                <Badge colorScheme={color}>
                                  <Icon as={FiCheckCircle} mr={1} />
                                  Получено
                                </Badge>
                              ) : (
                                <Badge colorScheme="gray">
                                  <Icon as={FiXCircle} mr={1} />
                                  Заблокировано
                                </Badge>
                              )}
                            </HStack>

                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold" color="white" fontSize="lg">
                                {achievement.title}
                              </Text>
                              <Text color="gray.400" fontSize="sm">
                                {achievement.description}
                              </Text>
                            </VStack>

                            <Tag colorScheme="purple" size="sm">
                              {achievement.category === "learning" && "Обучение"}
                              {achievement.category === "practice" && "Практика"}
                              {achievement.category === "social" && "Социальное"}
                              {achievement.category === "streak" && "Серия"}
                              {achievement.category === "special" && "Специальное"}
                            </Tag>
                          </VStack>
                        </CardBody>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* Activity Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading fontSize="xl" color="white">
                  📊 История активности
                </Heading>

                {isLoadingActivity ? (
                  <Box display="flex" justifyContent="center" py={20}>
                    <Spinner size="xl" color="purple.500" />
                  </Box>
                ) : recentActivity.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    {recentActivity.map((activity) => {
                      const task = HOMEWORK_TASKS.find((t) => t.id === activity.taskId);
                      const timestamp = activity.timestamp?.toDate
                        ? activity.timestamp.toDate()
                        : new Date();

                      return (
                        <Card
                          key={activity.id}
                          bg="rgba(255,255,255,0.05)"
                          borderRadius="xl"
                          borderLeft="4px solid"
                          borderColor={activity.passed ? "green.500" : "red.500"}
                        >
                          <CardBody>
                            <HStack justify="space-between">
                              <VStack align="start" spacing={2}>
                                <HStack spacing={2}>
                                  <Icon
                                    as={activity.passed ? FiCheckCircle : FiXCircle}
                                    color={activity.passed ? "green.400" : "red.400"}
                                  />
                                  <Text fontWeight="bold" color="white">
                                    {task?.title || activity.taskId}
                                  </Text>
                                </HStack>
                                <Text color="gray.400" fontSize="sm">
                                  {activity.passed ? "Выполнено" : "Не выполнено"}
                                </Text>
                                <Text color="gray.500" fontSize="xs">
                                  <Icon as={FiClock} mr={1} />
                                  {timestamp.toLocaleString("ru-RU")}
                                </Text>
                              </VStack>
                              <Button
                                size="sm"
                                bg="rgba(255,255,255,0.1)"
                                color="white"
                                _hover={{ bg: "rgba(255,255,255,0.2)" }}
                                onClick={() => {
                                  toast({
                                    title: "Код скопирован",
                                    status: "info",
                                  });
                                  navigator.clipboard.writeText(activity.code || "");
                                }}
                              >
                                Копировать код
                              </Button>
                            </HStack>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </VStack>
                ) : (
                  <Box
                    bg="rgba(255,255,255,0.05)"
                    borderRadius="xl"
                    p={10}
                    textAlign="center"
                  >
                    <Icon as={FiActivity} w={16} h={16} color="gray.600" mb={4} />
                    <Text color="gray.400" fontSize="lg">
                      Пока нет активности
                    </Text>
                    <Text color="gray.500" fontSize="sm" mt={2}>
                      Начните выполнять задания, чтобы отслеживать прогресс
                    </Text>
                  </Box>
                )}
              </VStack>
            </TabPanel>

            {/* Messages Tab */}
            <TabPanel>
              <ChatInbox
                onBack={() => {}}
                onViewProfile={() => {}}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Edit Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader color="white">Редактировать профиль</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="gray.300">Имя</FormLabel>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  bg="rgba(255,255,255,0.1)"
                  color="white"
                  borderColor="gray.600"
                  placeholder="Ваше имя"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="gray.300">Цвет никнейма</FormLabel>
                <HStack spacing={2}>
                  <Input
                    type="color"
                    value={editNicknameColor}
                    onChange={(e) => setEditNicknameColor(e.target.value)}
                    w={16}
                    h={10}
                    p={1}
                    cursor="pointer"
                  />
                  <Input
                    value={editNicknameColor}
                    onChange={(e) => setEditNicknameColor(e.target.value)}
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    borderColor="gray.600"
                    placeholder="#ffffff"
                    flex={1}
                  />
                </HStack>
                <Text color="gray.500" fontSize="xs" mt={1}>
                  Пример: <Text as="span" color={editNicknameColor} fontWeight="bold">{displayName}</Text>
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel color="gray.300">Пользовательский тег</FormLabel>
                <HStack spacing={2}>
                  <Icon as={FiHash} color="gray.400" />
                  <Input
                    value={editCustomTag}
                    onChange={(e) => setEditCustomTag(e.target.value)}
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    borderColor="gray.600"
                    placeholder="Например: Python Master, Junior Dev, etc."
                  />
                </HStack>
                <Text color="gray.500" fontSize="xs" mt={1}>
                  Этот тег будет отображаться рядом с вашим никнеймом
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel color="gray.300">Биография</FormLabel>
                <Textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  bg="rgba(255,255,255,0.1)"
                  color="white"
                  borderColor="gray.600"
                  placeholder="Расскажите о себе..."
                  rows={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              color="gray.400"
              mr={3}
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button
              bg="purple.600"
              color="white"
              _hover={{ bg: "purple.700" }}
              onClick={handleSaveProfile}
              isLoading={isSaving}
            >
              Сохранить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
