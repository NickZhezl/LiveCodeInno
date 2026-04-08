import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Icon,
  Progress,
  SimpleGrid,
  Card,
  CardBody,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { FiArrowLeft, FiAward, FiCheck, FiLock } from "react-icons/fi";
import { ACHIEVEMENTS, Achievement } from "../data/achievements";
import { useAuth } from "../contexts/AuthContext";
import { firestore } from "../main";
import { doc, getDoc } from "firebase/firestore";

interface AchievementsProps {
  onBack: () => void;
}

export default function Achievements({ onBack }: AchievementsProps) {
  const { userData } = useAuth();
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      loadAchievements();
    }
  }, [userData]);

  async function loadAchievements() {
    if (!userData) return;
    
    try {
      const achievementsRef = doc(firestore, "users", userData.uid, "achievements", "progress");
      const achievementsDoc = await getDoc(achievementsRef);
      
      if (achievementsDoc.exists()) {
        const data = achievementsDoc.data();
        setUserAchievements(data.achievements || ACHIEVEMENTS);
        setTotalXP(data.totalXP || 0);
      } else {
        setUserAchievements(ACHIEVEMENTS);
        setTotalXP(0);
      }
    } catch (error) {
      console.error("Error loading achievements:", error);
      setUserAchievements(ACHIEVEMENTS);
    } finally {
      setLoading(false);
    }
  }

  const unlockedCount = userAchievements.filter(a => a.unlocked).length;
  const totalCount = userAchievements.length;
  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  const categories = [
    { id: "all", label: "Все", icon: FiAward },
    { id: "learning", label: "Обучение", icon: FiAward },
    { id: "practice", label: "Практика", icon: FiAward },
    { id: "social", label: "Социальные", icon: FiAward },
    { id: "streak", label: "Серии", icon: FiAward },
    { id: "special", label: "Специальные", icon: FiAward },
  ];

  if (loading) {
    return (
      <Box minH="100vh" bg="#0f0a19" display="flex" alignItems="center" justifyContent="center">
        <Text color="white">Загрузка достижений...</Text>
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
              🏆 Достижения
            </Heading>
          </HStack>
          <Badge colorScheme="purple" fontSize="md" px={4} py={2} borderRadius="full">
            {totalXP} XP
          </Badge>
        </HStack>
      </Box>

      <Box p={6} maxW="1200px" mx="auto">
        {/* Progress Overview */}
        <Card bg="rgba(255,255,255,0.05)" borderRadius="xl" mb={6} p={6}>
          <CardBody p={0}>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text color="white" fontSize="lg" fontWeight="bold">
                  Общий прогресс
                </Text>
                <Text color="gray.400">
                  {unlockedCount} / {totalCount}
                </Text>
              </HStack>
              <Progress
                value={progressPercent}
                size="lg"
                colorScheme="purple"
                borderRadius="full"
              />
              <Text color="gray.400" fontSize="sm">
                {progressPercent.toFixed(1)}% завершено
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Achievements Tabs */}
        <Tabs variant="soft-rounded" colorScheme="purple" size="md">
          <TabList justifyContent="center" mb={6} flexWrap="wrap">
            {categories.map((cat) => (
              <Tab
                key={cat.id}
                _selected={{ bg: "purple.600", color: "white" }}
                px={4}
                py={2}
                borderRadius="full"
                fontSize="sm"
                fontWeight="bold"
                m={1}
              >
                <Icon as={cat.icon} mr={2} />
                {cat.label}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {categories.map((cat) => (
              <TabPanel key={cat.id} px={0}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {userAchievements
                    .filter((a) => cat.id === "all" || a.category === cat.id)
                    .map((achievement) => (
                      <Card
                        key={achievement.id}
                        bg={achievement.unlocked ? "rgba(128,0,255,0.15)" : "rgba(255,255,255,0.05)"}
                        borderRadius="xl"
                        p={4}
                        border={achievement.unlocked ? "1px solid rgba(128,0,255,0.3)" : "1px solid rgba(255,255,255,0.1)"}
                        opacity={achievement.unlocked ? 1 : 0.6}
                      >
                        <CardBody p={0}>
                          <VStack align="start" spacing={3}>
                            <HStack justify="space-between" w="100%">
                              <Text fontSize="3xl">
                                {achievement.icon}
                              </Text>
                              {achievement.unlocked ? (
                                <Badge colorScheme="green" fontSize="xs" px={2} py={1} borderRadius="full">
                                  <Icon as={FiCheck} mr={1} />
                                  Получено
                                </Badge>
                              ) : (
                                <Badge colorScheme="gray" fontSize="xs" px={2} py={1} borderRadius="full">
                                  <Icon as={FiLock} mr={1} />
                                  Заблокировано
                                </Badge>
                              )}
                            </HStack>
                            
                            <VStack align="start" spacing={1}>
                              <Text color="white" fontWeight="bold" fontSize="lg">
                                {achievement.title}
                              </Text>
                              <Text color="gray.400" fontSize="sm">
                                {achievement.description}
                              </Text>
                            </VStack>

                            <HStack justify="space-between" w="100%">
                              <Badge colorScheme="purple" fontSize="xs">
                                +{achievement.xpReward} XP
                              </Badge>
                              <Text color="gray.500" fontSize="xs">
                                {achievement.requirement} {achievement.category === "streak" ? "дней" : "раз"}
                              </Text>
                            </HStack>

                            {achievement.unlocked && achievement.unlockedAt && (
                              <Text color="gray.500" fontSize="xs">
                                Получено: {achievement.unlockedAt.toLocaleDateString()}
                              </Text>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                </SimpleGrid>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}
