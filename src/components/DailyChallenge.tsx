import { useState, useEffect } from "react";
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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { FiClock, FiCheckCircle, FiRefreshCw, FiZap } from "react-icons/fi";
import { Editor } from "@monaco-editor/react";
import { executePythonLocal } from "../utils/localExecutor";
import { useAuth } from "../contexts/AuthContext";
import { firestore } from "../main";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface DailyChallengeProps {
  onBack: () => void;
}

interface Challenge {
  id: string;
  date: string;
  title: string;
  description: string;
  starterCode: string;
  testCode: string;
  expectedOutput: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
}

const DAILY_CHALLENGES: Challenge[] = [
  {
    id: "dc-1",
    date: "2026-04-01",
    title: "Палиндром строки",
    description: "Напишите функцию, которая проверяет, является ли строка палиндромом",
    starterCode: `def is_palindrome(s):
    # Ваш код здесь
    pass

print(is_palindrome("aba"))
print(is_palindrome("abc"))
`,
    testCode: `
assert is_palindrome("aba") == True
assert is_palindrome("abc") == False
assert is_palindrome("") == True
assert is_palindrome("a") == True
assert is_palindrome("abba") == True
print("TESTS_PASSED")
`,
    expectedOutput: "TESTS_PASSED",
    difficulty: "easy",
    points: 50,
  },
  {
    id: "dc-2",
    date: "2026-04-02",
    title: "Числа Фибоначчи",
    description: "Напишите функцию, возвращающую n-е число Фибоначчи",
    starterCode: `def fibonacci(n):
    # Ваш код здесь
    pass

print(fibonacci(0))
print(fibonacci(1))
print(fibonacci(10))
`,
    testCode: `
assert fibonacci(0) == 0
assert fibonacci(1) == 1
assert fibonacci(10) == 55
assert fibonacci(5) == 5
print("TESTS_PASSED")
`,
    expectedOutput: "TESTS_PASSED",
    difficulty: "medium",
    points: 100,
  },
  {
    id: "dc-3",
    date: "2026-04-03",
    title: "Подсчет гласных",
    description: "Напишите функцию, подсчитывающую количество гласных в строке",
    starterCode: `def count_vowels(s):
    # Ваш код здесь
    pass

print(count_vowels("hello"))
print(count_vowels("world"))
`,
    testCode: `
assert count_vowels("hello") == 2
assert count_vowels("world") == 1
assert count_vowels("aeiou") == 5
assert count_vowels("") == 0
print("TESTS_PASSED")
`,
    expectedOutput: "TESTS_PASSED",
    difficulty: "easy",
    points: 50,
  },
  {
    id: "dc-4",
    date: "2026-04-04",
    title: "Сортировка пузырьком",
    description: "Реализуйте алгоритм сортировки пузырьком",
    starterCode: `def bubble_sort(arr):
    # Ваш код здесь
    pass

print(bubble_sort([5, 3, 1, 4, 2]))
`,
    testCode: `
assert bubble_sort([5, 3, 1, 4, 2]) == [1, 2, 3, 4, 5]
assert bubble_sort([]) == []
assert bubble_sort([1]) == [1]
assert bubble_sort([2, 1]) == [1, 2]
print("TESTS_PASSED")
`,
    expectedOutput: "TESTS_PASSED",
    difficulty: "medium",
    points: 100,
  },
  {
    id: "dc-5",
    date: "2026-04-05",
    title: "Анаграммы",
    description: "Напишите функцию, проверяющую являются ли две строки анаграммами",
    starterCode: `def is_anagram(s1, s2):
    # Ваш код здесь
    pass

print(is_anagram("listen", "silent"))
print(is_anagram("hello", "world"))
`,
    testCode: `
assert is_anagram("listen", "silent") == True
assert is_anagram("hello", "world") == False
assert is_anagram("", "") == True
assert is_anagram("a", "a") == True
print("TESTS_PASSED")
`,
    expectedOutput: "TESTS_PASSED",
    difficulty: "easy",
    points: 50,
  },
  {
    id: "dc-6",
    date: "2026-04-06",
    title: "Сумма цифр",
    description: "Напишите функцию, вычисляющую сумму цифр числа",
    starterCode: `def sum_of_digits(n):
    # Ваш код здесь
    pass

print(sum_of_digits(123))
print(sum_of_digits(999))
`,
    testCode: `
assert sum_of_digits(123) == 6
assert sum_of_digits(999) == 27
assert sum_of_digits(0) == 0
assert sum_of_digits(100) == 1
print("TESTS_PASSED")
`,
    expectedOutput: "TESTS_PASSED",
    difficulty: "easy",
    points: 50,
  },
  {
    id: "dc-7",
    date: "2026-04-07",
    title: "Обратный список",
    description: "Напишите функцию, переворачивающую список без использования reverse()",
    starterCode: `def reverse_list(lst):
    # Ваш код здесь
    pass

print(reverse_list([1, 2, 3, 4, 5]))
`,
    testCode: `
assert reverse_list([1, 2, 3, 4, 5]) == [5, 4, 3, 2, 1]
assert reverse_list([]) == []
assert reverse_list([1]) == [1]
print("TESTS_PASSED")
`,
    expectedOutput: "TESTS_PASSED",
    difficulty: "easy",
    points: 50,
  },
];

export default function DailyChallenge({ onBack }: DailyChallengeProps) {
  const { userData } = useAuth();
  const toast = useToast();
  const [code, setCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; output: string } | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [streak, setStreak] = useState(0);
  const [completedToday, setCompletedToday] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    loadDailyChallenge();
  }, []);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      toast({ title: "Время вышло!", status: "warning" });
    }
  }, [timeLeft, timerActive]);

  const getTodayString = () => {
    return new Date().toISOString().split("T")[0];
  };

  const loadDailyChallenge = async () => {
    if (!userData) return;

    // Get today's challenge (cycle through available challenges)
    const today = getTodayString();
    const dayIndex = new Date().getDate() % DAILY_CHALLENGES.length;
    const challenge = DAILY_CHALLENGES[dayIndex];
    setCurrentChallenge(challenge);
    setCode(challenge.starterCode);

    // Check if already completed today
    const completionRef = doc(firestore, "users", userData.uid, "dailyChallenges", today);
    const completionSnap = await getDoc(completionRef);
    if (completionSnap.exists()) {
      setCompletedToday(true);
      setTestResults({ passed: true, output: "✅ Задание выполнено!" });
    }

    // Load streak
    const streakRef = doc(firestore, "users", userData.uid, "stats", "dailyChallenge");
    const streakSnap = await getDoc(streakRef);
    if (streakSnap.exists()) {
      setStreak(streakSnap.data().streak || 0);
    }
  };

  const checkSolution = async () => {
    if (!currentChallenge || !userData) return;

    setIsChecking(true);
    setTestResults(null);

    try {
      const fullCode = code + "\n" + currentChallenge.testCode;
      const result = await executePythonLocal(fullCode);

      if (result.stderr) {
        setTestResults({ passed: false, output: `❌ Ошибка:\n${result.stderr}` });
        toast({ title: "Тесты не пройдены", status: "error" });
      } else if (result.stdout.includes("TESTS_PASSED")) {
        setTestResults({ passed: true, output: `✅ Все тесты пройдены!\n+${currentChallenge.points} очков` });
        toast({ title: "Задание выполнено!", status: "success" });

        // Save completion
        const today = getTodayString();
        const completionRef = doc(firestore, "users", userData.uid, "dailyChallenges", today);
        await setDoc(completionRef, {
          completed: true,
          points: currentChallenge.points,
          timestamp: new Date(),
          timeUsed: 1800 - timeLeft,
        });

        // Update streak
        const streakRef = doc(firestore, "users", userData.uid, "stats", "dailyChallenge");
        await setDoc(streakRef, {
          streak: streak + 1,
          lastCompleted: today,
          totalPoints: (streak + 1) * currentChallenge.points,
        }, { merge: true });

        setCompletedToday(true);
        setStreak(streak + 1);
      } else {
        setTestResults({ passed: false, output: `❌ Тесты не пройдены:\n${result.stdout}` });
        toast({ title: "Тесты не пройдены", status: "error" });
      }
    } catch (error: any) {
      setTestResults({ passed: false, output: `❌ Ошибка выполнения:\n${error.message}` });
      toast({ title: "Ошибка", status: "error" });
    } finally {
      setIsChecking(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentChallenge) {
    return (
      <Box display="flex" justifyContent="center" py={20}>
        <Text color="gray.400">Загрузка задания...</Text>
      </Box>
    );
  }

  const difficultyColor = currentChallenge.difficulty === "easy" ? "green" : currentChallenge.difficulty === "medium" ? "yellow" : "red";

  return (
    <Box>
      {/* Header */}
      <HStack justify="space-between" mb={6}>
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
            🎯 Ежедневный вызов
          </Heading>
        </HStack>
        <HStack spacing={4}>
          <Badge colorScheme="orange" fontSize="md" px={3} py={1}>
            <Icon as={FiZap} mr={1} />
            Серия: {streak} дней
          </Badge>
          <Badge colorScheme={timerActive ? "red" : "gray"} fontSize="md" px={3} py={1}>
            <Icon as={FiClock} mr={1} />
            {formatTime(timeLeft)}
          </Badge>
        </HStack>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Challenge Info */}
        <VStack spacing={4} align="stretch">
          <Card bg="rgba(255,255,255,0.05)" borderRadius="xl">
            <CardBody>
              <HStack justify="space-between" mb={3}>
                <Heading fontSize="xl" color="white">
                  {currentChallenge.title}
                </Heading>
                <Badge colorScheme={difficultyColor} fontSize="md">
                  {currentChallenge.difficulty === "easy" ? "Легкий" : currentChallenge.difficulty === "medium" ? "Средний" : "Сложный"}
                </Badge>
              </HStack>
              <Text color="gray.300" mb={4}>
                {currentChallenge.description}
              </Text>
              <HStack spacing={4}>
                <Stat>
                  <StatLabel color="gray.400">Очки</StatLabel>
                  <StatNumber color="yellow.400">{currentChallenge.points}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color="gray.400">Статус</StatLabel>
                  <StatNumber color={completedToday ? "green.400" : "gray.400"}>
                    {completedToday ? "✅ Выполнено" : "⏳ Ожидает"}
                  </StatNumber>
                </Stat>
              </HStack>
            </CardBody>
          </Card>

          {testResults && (
            <Alert
              status={testResults.passed ? "success" : "error"}
              borderRadius="lg"
              flexDirection="column"
              alignItems="flex-start"
            >
              <AlertIcon />
              <AlertTitle>{testResults.passed ? "Отлично!" : "Попробуйте ещё раз"}</AlertTitle>
              <AlertDescription>
                <Box as="pre" whiteSpace="pre-wrap" fontFamily="mono" fontSize="sm" mt={2}>
                  {testResults.output}
                </Box>
              </AlertDescription>
            </Alert>
          )}
        </VStack>

        {/* Code Editor */}
        <VStack spacing={4} align="stretch">
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text color="white" fontWeight="bold">Редактор кода:</Text>
              <Button
                size="sm"
                bg="rgba(255,255,255,0.1)"
                color="white"
                _hover={{ bg: "rgba(255,255,255,0.2)" }}
                onClick={() => setCode(currentChallenge.starterCode)}
                leftIcon={<Icon as={FiRefreshCw} />}
              >
                Сбросить
              </Button>
            </HStack>
            <Editor
              height="400px"
              theme="vs-dark"
              language="python"
              value={code}
              onChange={(val) => setCode(val || "")}
              onMount={() => {}}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
              }}
            />
          </Box>

          <Button
            bg="green.600"
            color="white"
            _hover={{ bg: "green.700" }}
            onClick={checkSolution}
            isLoading={isChecking}
            loadingText="Проверка..."
            isDisabled={completedToday}
            leftIcon={<Icon as={FiCheckCircle} />}
          >
            {completedToday ? "✅ Уже выполнено" : "Проверить решение"}
          </Button>
        </VStack>
      </SimpleGrid>
    </Box>
  );
}
