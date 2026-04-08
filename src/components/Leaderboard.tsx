import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Icon,
  Avatar,
  Badge,
  Spinner,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  SimpleGrid,
} from "@chakra-ui/react";
import { FiAward, FiStar, FiZap, FiCheckCircle } from "react-icons/fi";
import { firestore } from "../main";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

interface LeaderboardProps {
  onViewProfile: (userId: string) => void;
  onBack?: () => void;
}

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  nicknameColor?: string;
  customTag?: string;
  role: "user" | "admin";
  points: number;
  homeworkCompleted: number;
  problemsSolved: number;
  achievements: number;
  streak: number;
  liveCodingSessions: number;
}

export default function Leaderboard({ onViewProfile, onBack }: LeaderboardProps) {
  const { userData } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number>(0);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const calculatePoints = async (userDoc: any): Promise<number> => {
    let points = 0;

    // Homework: 10 pts each
    const progressRef = doc(firestore, "users", userDoc.uid, "progress", "homework");
    const progressSnap = await getDoc(progressRef);
    const completedTasks = progressSnap.exists() ? progressSnap.data().completedTasks || [] : [];
    points += completedTasks.length * 10;

    // Achievements: 20 pts each
    const achievementsRef = doc(firestore, "users", userDoc.uid, "achievements", "unlocked");
    const achievementsSnap = await getDoc(achievementsRef);
    const unlockedAchievements = achievementsSnap.exists() ? achievementsSnap.data().achievementIds || [] : [];
    points += unlockedAchievements.length * 20;

    // Streak bonus: 5 pts per day
    points += (userDoc.currentStreak || 0) * 5;

    // Live coding: 5 pts each
    points += (userDoc.liveCodingSessions || 0) * 5;

    return points;
  };

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const usersRef = collection(firestore, "users");
      const usersSnap = await getDocs(usersRef);

      const entries: LeaderboardEntry[] = [];

      for (const userDoc of usersSnap.docs) {
        const userData2 = userDoc.data();
        const points = await calculatePoints({ uid: userDoc.id, ...userData2 });

        // Get homework count
        const progressRef = doc(firestore, "users", userDoc.id, "progress", "homework");
        const progressSnap = await getDoc(progressRef);
        const homeworkCompleted = progressSnap.exists() ? (progressSnap.data().completedTasks || []).length : 0;

        // Get achievements count
        const achievementsRef = doc(firestore, "users", userDoc.id, "achievements", "unlocked");
        const achievementsSnap = await getDoc(achievementsRef);
        const achievements = achievementsSnap.exists() ? (achievementsSnap.data().achievementIds || []).length : 0;

        entries.push({
          uid: userDoc.id,
          displayName: userData2.displayName || "User",
          avatarUrl: userData2.avatarUrl,
          nicknameColor: userData2.nicknameColor,
          customTag: userData2.customTag,
          role: userData2.role || "user",
          points,
          homeworkCompleted,
          problemsSolved: 0, // Would need problem tracking
          achievements,
          streak: userData2.currentStreak || 0,
          liveCodingSessions: userData2.liveCodingSessions || 0,
        });
      }

      // Sort by points descending
      entries.sort((a, b) => b.points - a.points);
      setLeaderboard(entries);

      // Find user's rank
      if (userData) {
        const userIndex = entries.findIndex((e) => e.uid === userData.uid);
        setUserRank(userIndex + 1);
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "yellow.400";
    if (rank === 2) return "gray.300";
    if (rank === 3) return "orange.400";
    return "gray.500";
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={20}>
        <Spinner size="xl" color="purple.500" />
      </Box>
    );
  }

  return (
    <Box>
      {onBack && (
        <Button
          onClick={onBack}
          bg="rgba(255,255,255,0.1)"
          color="white"
          _hover={{ bg: "rgba(255,255,255,0.2)" }}
          size="sm"
          mb={4}
        >
          ← Назад
        </Button>
      )}
      <Heading fontSize="2xl" color="white" mb={6}>
        🏆 Таблица лидеров
      </Heading>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <Box mb={8}>
          <SimpleGrid columns={3} spacing={4} maxW="800px" mx="auto">
            {/* 2nd Place */}
            <VStack spacing={3} pt={8}>
              <Text fontSize="4xl">{getMedalIcon(2)}</Text>
              <Avatar
                size="xl"
                name={leaderboard[1].displayName}
                src={leaderboard[1].avatarUrl || undefined}
                bg="purple.600"
                cursor="pointer"
                onClick={() => onViewProfile(leaderboard[1].uid)}
              />
              <Text
                color={leaderboard[1].nicknameColor || "white"}
                fontWeight="bold"
                fontSize="lg"
                cursor="pointer"
                onClick={() => onViewProfile(leaderboard[1].uid)}
              >
                {leaderboard[1].displayName}
              </Text>
              <Badge colorScheme="purple" fontSize="md">
                {leaderboard[1].points} pts
              </Badge>
            </VStack>

            {/* 1st Place */}
            <VStack spacing={3}>
              <Text fontSize="5xl">{getMedalIcon(1)}</Text>
              <Avatar
                size="2xl"
                name={leaderboard[0].displayName}
                src={leaderboard[0].avatarUrl || undefined}
                bg="yellow.500"
                cursor="pointer"
                onClick={() => onViewProfile(leaderboard[0].uid)}
              />
              <Text
                color={leaderboard[0].nicknameColor || "white"}
                fontWeight="bold"
                fontSize="xl"
                cursor="pointer"
                onClick={() => onViewProfile(leaderboard[0].uid)}
              >
                {leaderboard[0].displayName}
              </Text>
              <Badge colorScheme="yellow" fontSize="lg">
                {leaderboard[0].points} pts
              </Badge>
            </VStack>

            {/* 3rd Place */}
            <VStack spacing={3} pt={12}>
              <Text fontSize="4xl">{getMedalIcon(3)}</Text>
              <Avatar
                size="xl"
                name={leaderboard[2].displayName}
                src={leaderboard[2].avatarUrl || undefined}
                bg="purple.600"
                cursor="pointer"
                onClick={() => onViewProfile(leaderboard[2].uid)}
              />
              <Text
                color={leaderboard[2].nicknameColor || "white"}
                fontWeight="bold"
                fontSize="lg"
                cursor="pointer"
                onClick={() => onViewProfile(leaderboard[2].uid)}
              >
                {leaderboard[2].displayName}
              </Text>
              <Badge colorScheme="orange" fontSize="md">
                {leaderboard[2].points} pts
              </Badge>
            </VStack>
          </SimpleGrid>
        </Box>
      )}

      {/* User's Rank */}
      {userData && userRank > 0 && (
        <Card bg="rgba(128,0,255,0.1)" borderRadius="xl" mb={6} border="2px solid" borderColor="purple.500">
          <CardBody>
            <HStack justify="space-between">
              <HStack spacing={4}>
                <Text fontSize="2xl" fontWeight="bold" color="purple.400">
                  #{userRank}
                </Text>
                <Text color="white" fontSize="lg">
                  Ваш ранг
                </Text>
              </HStack>
              <Text color="purple.300" fontSize="xl" fontWeight="bold">
                {leaderboard[userRank - 1]?.points || 0} очков
              </Text>
            </HStack>
          </CardBody>
        </Card>
      )}

      {/* Full Leaderboard Table */}
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th color="gray.400">Ранг</Th>
              <Th color="gray.400">Пользователь</Th>
              <Th color="gray.400" isNumeric>Очки</Th>
              <Th color="gray.400" isNumeric>ДЗ</Th>
              <Th color="gray.400" isNumeric>Достижения</Th>
              <Th color="gray.400" isNumeric>Серия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {leaderboard.slice(0, 50).map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = userData?.uid === entry.uid;

              return (
                <Tr
                  key={entry.uid}
                  bg={isCurrentUser ? "rgba(128,0,255,0.2)" : "transparent"}
                  _hover={{ bg: "rgba(255,255,255,0.05)" }}
                  cursor="pointer"
                  onClick={() => onViewProfile(entry.uid)}
                >
                  <Td>
                    <Text
                      fontSize="xl"
                      fontWeight="bold"
                      color={getRankColor(rank)}
                    >
                      {getMedalIcon(rank)}
                    </Text>
                  </Td>
                  <Td>
                    <HStack spacing={3}>
                      <Avatar
                        size="sm"
                        name={entry.displayName}
                        src={entry.avatarUrl || undefined}
                        bg="purple.600"
                      />
                      <VStack align="start" spacing={0}>
                        <HStack spacing={2}>
                          <Text
                            color={entry.nicknameColor || "white"}
                            fontWeight="bold"
                          >
                            {entry.displayName}
                          </Text>
                          {entry.customTag && (
                            <Badge colorScheme="purple" fontSize="xs">
                              {entry.customTag}
                            </Badge>
                          )}
                        </HStack>
                        <Text color="gray.500" fontSize="xs">
                          {entry.role === "admin" ? "Админ" : "Пользователь"}
                        </Text>
                      </VStack>
                    </HStack>
                  </Td>
                  <Td isNumeric>
                    <Text color="white" fontWeight="bold" fontSize="lg">
                      {entry.points}
                    </Text>
                  </Td>
                  <Td isNumeric>
                    <Text color="gray.300">{entry.homeworkCompleted}</Text>
                  </Td>
                  <Td isNumeric>
                    <Text color="gray.300">{entry.achievements}</Text>
                  </Td>
                  <Td isNumeric>
                    <HStack justify="flex-end" spacing={1}>
                      <Icon as={FiZap} color="orange.400" />
                      <Text color="gray.300">{entry.streak}д</Text>
                    </HStack>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Points System Info */}
      <Card bg="rgba(255,255,255,0.05)" borderRadius="xl" mt={6}>
        <CardBody>
          <Heading fontSize="lg" color="white" mb={4}>
            📊 Система очков
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <HStack spacing={3}>
              <Icon as={FiCheckCircle} color="green.400" />
              <Text color="gray.300">Домашнее задание: <Text as="span" color="white" fontWeight="bold">+10 очков</Text></Text>
            </HStack>
            <HStack spacing={3}>
              <Icon as={FiAward} color="purple.400" />
              <Text color="gray.300">Достижение: <Text as="span" color="white" fontWeight="bold">+20 очков</Text></Text>
            </HStack>
            <HStack spacing={3}>
              <Icon as={FiZap} color="orange.400" />
              <Text color="gray.300">Серия (день): <Text as="span" color="white" fontWeight="bold">+5 очков</Text></Text>
            </HStack>
            <HStack spacing={3}>
              <Icon as={FiStar} color="blue.400" />
              <Text color="gray.300">Live Coding: <Text as="span" color="white" fontWeight="bold">+5 очков</Text></Text>
            </HStack>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
}
