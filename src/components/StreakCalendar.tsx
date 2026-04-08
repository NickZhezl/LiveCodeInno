import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  SimpleGrid,
  Tooltip as ChakraTooltip,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Icon,
} from "@chakra-ui/react";
import { FiCalendar, FiZap, FiAward } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { firestore } from "../main";
import { collection, query, where, getDocs } from "firebase/firestore";

interface StreakCalendarProps {
  userId?: string;
  onBack?: () => void;
}

export default function StreakCalendar({ userId, onBack }: StreakCalendarProps) {
  const { userData: currentUserData } = useAuth();
  const [activityData, setActivityData] = useState<Record<string, number>>({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setActiveDays] = useState(0);
  const [totalActiveDays, setTotalActiveDays] = useState(0);

  useEffect(() => {
    loadActivityData();
  }, [userId]);

  const loadActivityData = async () => {
    const targetUserId = userId || currentUserData?.uid;
    if (!targetUserId) return;

    try {
      // Load submissions
      const submissionsRef = collection(firestore, "submissions");
      const q = query(submissionsRef, where("userId", "==", targetUserId));
      const submissionsSnap = await getDocs(q);

      const activity: Record<string, number> = {};
      submissionsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.timestamp) {
          const date = data.timestamp.toDate ? data.timestamp.toDate().toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
          activity[date] = (activity[date] || 0) + 1;
        }
      });

      setActivityData(activity);

      // Calculate streaks
      const today = new Date();
      let streak = 0;
      let longest = 0;
      let tempStreak = 0;
      let totalDays = 0;

      for (let i = 364; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        if (activity[dateStr]) {
          tempStreak++;
          totalDays++;
          longest = Math.max(longest, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      // Calculate current streak
      for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        if (activity[dateStr]) {
          streak++;
        } else {
          if (i > 0) break;
        }
      }

      setCurrentStreak(streak);
      setActiveDays(longest);
      setTotalActiveDays(totalDays);
    } catch (error) {
      console.error("Error loading activity data:", error);
    }
  };

  const getColorIntensity = (count: number) => {
    if (!count) return "rgba(255,255,255,0.03)";
    if (count === 1) return "rgba(128,0,255,0.2)";
    if (count === 2) return "rgba(128,0,255,0.4)";
    if (count === 3) return "rgba(128,0,255,0.6)";
    return "rgba(128,0,255,0.8)";
  };

  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();

    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const count = activityData[dateStr] || 0;

      days.push({
        date: dateStr,
        count,
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const getMonthLabel = (monthIndex: number) => {
    const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
    return months[monthIndex];
  };

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
        📅 Календарь активности
      </Heading>

      {/* Stats */}
      <SimpleGrid columns={3} spacing={4} mb={6}>
        <Card bg="rgba(255,255,255,0.05)" borderRadius="xl">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">
                <Icon as={FiZap} mr={1} />
                Текущая серия
              </StatLabel>
              <StatNumber color="orange.400">{currentStreak} дней</StatNumber>
              <StatHelpText color="gray.500">Подряд</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="rgba(255,255,255,0.05)" borderRadius="xl">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">
                <Icon as={FiAward} mr={1} />
                Лучшая серия
              </StatLabel>
              <StatNumber color="purple.400">{longestStreak} дней</StatNumber>
              <StatHelpText color="gray.500">Рекорд</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="rgba(255,255,255,0.05)" borderRadius="xl">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">
                <Icon as={FiCalendar} mr={1} />
                Активных дней
              </StatLabel>
              <StatNumber color="green.400">{totalActiveDays}</StatNumber>
              <StatHelpText color="gray.500">За год</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Calendar Heatmap */}
      <Card bg="rgba(255,255,255,0.05)" borderRadius="xl" p={6}>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Text color="white" fontWeight="bold">
              Последние 365 дней
            </Text>
            <HStack spacing={2}>
              <Text color="gray.500" fontSize="xs">Меньше</Text>
              {[0, 1, 2, 3, 4].map((i) => (
                <Box
                  key={i}
                  w={3}
                  h={3}
                  borderRadius="sm"
                  bg={getColorIntensity(i)}
                />
              ))}
              <Text color="gray.500" fontSize="xs">Больше</Text>
            </HStack>
          </HStack>

          {/* Month labels and grid */}
          <Box overflowX="auto">
            <Box minW="700px">
              {/* Month labels */}
              <HStack spacing={0} mb={2} justifyContent="space-between">
                {Array.from({ length: 12 }, (_, i) => {
                  const monthIndex = (new Date().getMonth() - 11 + i + 12) % 12;
                  return (
                    <Text key={i} color="gray.500" fontSize="xs" minW="50px">
                      {getMonthLabel(monthIndex)}
                    </Text>
                  );
                })}
              </HStack>

              {/* Days grid - 7 rows (days of week) x 52 columns (weeks) */}
              <Box>
                {Array.from({ length: 7 }, (_, dayOfWeek) => (
                  <HStack key={dayOfWeek} spacing={0} mb={0}>
                    {Array.from({ length: 52 }, (_, weekIndex) => {
                      const dayIndex = weekIndex * 7 + dayOfWeek;
                      if (dayIndex >= calendarDays.length) return null;

                      const day = calendarDays[dayIndex];
                      const intensity = getColorIntensity(day.count);

                      return (
                        <ChakraTooltip
                          key={`${weekIndex}-${dayOfWeek}`}
                          label={`${day.date}: ${day.count} активностей`}
                        >
                          <Box
                            w={3}
                            h={3}
                            borderRadius="sm"
                            bg={intensity}
                            border="1px solid"
                            borderColor="rgba(255,255,255,0.05)"
                            _hover={{ transform: "scale(1.2)", zIndex: 10 }}
                            cursor="pointer"
                          />
                        </ChakraTooltip>
                      );
                    })}
                  </HStack>
                ))}
              </Box>
            </Box>
          </Box>
        </VStack>
      </Card>
    </Box>
  );
}
