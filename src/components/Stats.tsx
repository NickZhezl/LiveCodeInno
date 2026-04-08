import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Icon,
  SimpleGrid,
  Card,
  CardBody,
  Button,
  Progress,
  useToast,
} from "@chakra-ui/react";
import { FiArrowLeft, FiTrendingUp, FiAward, FiClock, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { firestore } from "../main";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

interface StatsProps {
  onBack: () => void;
}

export default function Stats({ onBack }: StatsProps) {
  const { userData } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState({
    totalProblems: 0,
    solvedProblems: 0,
    failedAttempts: 0,
    successRate: 0,
    totalTimeSpent: 0,
    currentStreak: 0,
    longestStreak: 0,
    topicsCompleted: 0,
    achievementsUnlocked: 0,
    totalXP: 0,
    level: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      loadStats();
    }
  }, [userData]);

  async function loadStats() {
    if (!userData) return;
    
    try {
      // Load user progress
      const progressRef = doc(firestore, "users", userData.uid, "progress", "homework");
      const progressDoc = await getDoc(progressRef);
      
      let solvedProblems = 0;
      let totalAttempts = 0;
      
      if (progressDoc.exists()) {
        const data = progressDoc.data();
        solvedProblems = data.completedTasks?.length || 0;
        totalAttempts = data.attempts?.length || 0;
      }

      // Load submissions
      const submissionsRef = collection(firestore, "submissions");
      const submissionsQuery = query(submissionsRef, where("userId", "==", userData.uid));
      const submissionsSnapshot = await getDocs(submissionsQuery);
      
      let totalTimeSpent = 0;
      let failedAttempts = 0;
      
      submissionsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.passed) {
          failedAttempts++;
        }
        // Estimate time spent (rough estimate)
        totalTimeSpent += 300; // 5 minutes per submission
      });

      const successRate = totalAttempts > 0 ? (solvedProblems / totalAttempts) * 100 : 0;
      const totalXP = solvedProblems * 50 + (totalAttempts - failedAttempts) * 20;
      const level = Math.floor(totalXP / 500) + 1;

      setStats({
        totalProblems: 11, // From problems bank
        solvedProblems,
        failedAttempts,
        successRate,
        totalTimeSpent,
        currentStreak: 0, // Would need streak tracking
        longestStreak: 0,
        topicsCompleted: 0,
        achievementsUnlocked: 0,
        totalXP,
        level,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      toast({ title: "Ошибка загрузки статистики", status: "error" });
    } finally {
      setLoading(false);
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}ч ${minutes}м`;
  };

  const xpForNextLevel = stats.level * 500;
  const currentLevelXP = stats.totalXP % 500;
  const levelProgress = (currentLevelXP / xpForNextLevel) * 100;

  if (loading) {
    return (
      <Box minH="100vh" bg="#0f0a19" display="flex" alignItems="center" justifyContent="center">
        <Text color="white">Загрузка статистики...</Text>
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
              leftIcon={<Icon as={FiArrowLeft} />}
            >
              Назад
            </Button>
            <Heading fontSize="2xl" color="white">
              📊 Статистика
            </Heading>
          </HStack>
          <Badge colorScheme="purple" fontSize="md" px={4} py={2} borderRadius="full">
            Уровень {stats.level}
          </Badge>
        </HStack>
      </Box>

      <Box p={6} maxW="1200px" mx="auto">
        {/* Level Progress */}
        <Card bg="rgba(255,255,255,0.05)" borderRadius="xl" mb={6} p={6}>
          <CardBody p={0}>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text color="white" fontSize="lg" fontWeight="bold">
                  Прогресс уровня
                </Text>
                <Text color="gray.400">
                  {currentLevelXP} / {xpForNextLevel} XP
                </Text>
              </HStack>
              <Progress
                value={levelProgress}
                size="lg"
                colorScheme="purple"
                borderRadius="full"
              />
              <Text color="gray.400" fontSize="sm">
                {levelProgress.toFixed(1)}% до уровня {stats.level + 1}
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={6}>
          {/* Problems Solved */}
          <Card bg="rgba(255,255,255,0.05)" borderRadius="xl" p={5}>
            <CardBody p={0}>
              <VStack align="start" spacing={3}>
                <HStack>
                  <Icon as={FiCheckCircle} w={8} h={8} color="green.400" />
                  <Text color="white" fontWeight="bold">Решено задач</Text>
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="green.400">
                  {stats.solvedProblems}
                </Text>
                <Text color="gray.400" fontSize="sm">
                  из {stats.totalProblems} задач
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Success Rate */}
          <Card bg="rgba(255,255,255,0.05)" borderRadius="xl" p={5}>
            <CardBody p={0}>
              <VStack align="start" spacing={3}>
                <HStack>
                  <Icon as={FiTrendingUp} w={8} h={8} color="blue.400" />
                  <Text color="white" fontWeight="bold">Успешность</Text>
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="blue.400">
                  {stats.successRate.toFixed(1)}%
                </Text>
                <Text color="gray.400" fontSize="sm">
                  {stats.failedAttempts} неудачных попыток
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Time Spent */}
          <Card bg="rgba(255,255,255,0.05)" borderRadius="xl" p={5}>
            <CardBody p={0}>
              <VStack align="start" spacing={3}>
                <HStack>
                  <Icon as={FiClock} w={8} h={8} color="purple.400" />
                  <Text color="white" fontWeight="bold">Время обучения</Text>
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="purple.400">
                  {formatTime(stats.totalTimeSpent)}
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Общее время
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Current Streak */}
          <Card bg="rgba(255,255,255,0.05)" borderRadius="xl" p={5}>
            <CardBody p={0}>
              <VStack align="start" spacing={3}>
                <HStack>
                  <Icon as={FiAward} w={8} h={8} color="orange.400" />
                  <Text color="white" fontWeight="bold">Текущая серия</Text>
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="orange.400">
                  {stats.currentStreak} дней
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Лучшая: {stats.longestStreak} дней
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Total XP */}
          <Card bg="rgba(255,255,255,0.05)" borderRadius="xl" p={5}>
            <CardBody p={0}>
              <VStack align="start" spacing={3}>
                <HStack>
                  <Icon as={FiAward} w={8} h={8} color="yellow.400" />
                  <Text color="white" fontWeight="bold">Всего XP</Text>
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="yellow.400">
                  {stats.totalXP}
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Опыт за всё время
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Achievements */}
          <Card bg="rgba(255,255,255,0.05)" borderRadius="xl" p={5}>
            <CardBody p={0}>
              <VStack align="start" spacing={3}>
                <HStack>
                  <Icon as={FiAward} w={8} h={8} color="pink.400" />
                  <Text color="white" fontWeight="bold">Достижения</Text>
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="pink.400">
                  {stats.achievementsUnlocked}
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Открыто достижений
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Weekly Activity */}
        <Card bg="rgba(255,255,255,0.05)" borderRadius="xl" p={6}>
          <CardBody p={0}>
            <Heading fontSize="xl" color="white" mb={4}>
              Активность за неделю
            </Heading>
            <SimpleGrid columns={7} spacing={2}>
              {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day, idx) => (
                <VStack key={idx} spacing={2}>
                  <Text color="gray.400" fontSize="xs">{day}</Text>
                  <Box
                    w="100%"
                    h="60px"
                    bg={idx < 5 ? "rgba(128,0,255,0.3)" : "rgba(255,255,255,0.05)"}
                    borderRadius="md"
                    display="flex"
                    alignItems="flex-end"
                    justifyContent="center"
                    pb={2}
                  >
                    <Text color="white" fontSize="xs">
                      {idx < 5 ? "✓" : ""}
                    </Text>
                  </Box>
                </VStack>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}
