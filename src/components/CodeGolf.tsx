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
import { FiCheckCircle, FiAward } from "react-icons/fi";
import { Editor } from "@monaco-editor/react";
import { executePythonLocal } from "../utils/localExecutor";
import { useAuth } from "../contexts/AuthContext";
import { firestore } from "../main";
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "firebase/firestore";

interface CodeGolfProps {
  onBack: () => void;
}

interface GolfChallenge {
  id: string;
  title: string;
  description: string;
  testCode: string;
  par: number;
  difficulty: "easy" | "medium" | "hard";
}

const GOLF_CHALLENGES: GolfChallenge[] = [
  {
    id: "golf-1",
    title: "Сумма чисел от 1 до N",
    description: "Напишите функцию sum_to_n(n), которая возвращает сумму чисел от 1 до n. Используйте минимальное количество символов!",
    testCode: `
assert sum_to_n(1) == 1
assert sum_to_n(5) == 15
assert sum_to_n(10) == 55
assert sum_to_n(100) == 5050
print("TESTS_PASSED")
`,
    par: 30,
    difficulty: "easy",
  },
  {
    id: "golf-2",
    title: "Палиндром в одну строку",
    description: "Напишите функцию is_palindrome(s), проверяющую является ли строка палиндромом. Минимум символов!",
    testCode: `
assert is_palindrome("aba") == True
assert is_palindrome("abc") == False
assert is_palindrome("") == True
assert is_palindrome("abba") == True
print("TESTS_PASSED")
`,
    par: 35,
    difficulty: "easy",
  },
  {
    id: "golf-3",
    title: "Фибоначчи",
    description: "Напишите функцию fib(n), возвращающую n-е число Фибоначчи. Чем короче, тем лучше!",
    testCode: `
assert fib(0) == 0
assert fib(1) == 1
assert fib(10) == 55
assert fib(20) == 6765
print("TESTS_PASSED")
`,
    par: 50,
    difficulty: "medium",
  },
  {
    id: "golf-4",
    title: "Подсчет гласных",
    description: "Напишите функцию count_vowels(s), подсчитывающую гласные в строке. Минимум символов!",
    testCode: `
assert count_vowels("hello") == 2
assert count_vowels("world") == 1
assert count_vowels("aeiou") == 5
assert count_vowels("") == 0
print("TESTS_PASSED")
`,
    par: 40,
    difficulty: "easy",
  },
  {
    id: "golf-5",
    title: "Обратный список",
    description: "Напишите функцию reverse_list(lst), переворачивающую список без reverse(). Минимум символов!",
    testCode: `
assert reverse_list([1, 2, 3]) == [3, 2, 1]
assert reverse_list([]) == []
assert reverse_list([1]) == [1]
print("TESTS_PASSED")
`,
    par: 25,
    difficulty: "easy",
  },
  {
    id: "golf-6",
    title: "Анаграммы",
    description: "Напишите функцию is_anagram(s1, s2), проверяющую являются ли строки анаграммами. Минимум символов!",
    testCode: `
assert is_anagram("listen", "silent") == True
assert is_anagram("hello", "world") == False
assert is_anagram("", "") == True
print("TESTS_PASSED")
`,
    par: 45,
    difficulty: "medium",
  },
];

export default function CodeGolf({ onBack }: CodeGolfProps) {
  const { userData } = useAuth();
  const toast = useToast();
  const [selectedChallenge, setSelectedChallenge] = useState<GolfChallenge | null>(null);
  const [code, setCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; output: string; charCount: number } | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    if (selectedChallenge) {
      loadSubmissions();
    }
  }, [selectedChallenge]);

  const loadSubmissions = async () => {
    if (!selectedChallenge) return;

    try {
      const submissionsRef = collection(firestore, "codeGolfSubmissions");
      const q = query(
        submissionsRef,
        where("challengeId", "==", selectedChallenge.id),
        orderBy("charCount", "asc")
      );
      const snapshot = await getDocs(q);
      const subs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSubmissions(subs.slice(0, 10));
    } catch (error) {
      console.error("Error loading submissions:", error);
    }
  };

  const checkSolution = async () => {
    if (!selectedChallenge || !userData) return;

    setIsChecking(true);
    setTestResults(null);

    try {
      const fullCode = code + "\n" + selectedChallenge.testCode;
      const result = await executePythonLocal(fullCode);

      const charCount = code.replace(/\s/g, "").length;

      if (result.stderr) {
        setTestResults({ passed: false, output: `❌ Ошибка:\n${result.stderr}`, charCount });
        toast({ title: "Тесты не пройдены", status: "error" });
      } else if (result.stdout.includes("TESTS_PASSED")) {
        setTestResults({
          passed: true,
          output: `✅ Все тесты пройдены!\nСимволов: ${charCount} (пар: ${selectedChallenge.par})`,
          charCount,
        });

        // Save submission
        await addDoc(collection(firestore, "codeGolfSubmissions"), {
          challengeId: selectedChallenge.id,
          userId: userData.uid,
          userName: userData.displayName,
          code,
          charCount,
          timestamp: serverTimestamp(),
        });

        toast({ title: "Отличное решение!", status: "success" });
        loadSubmissions();
      } else {
        setTestResults({ passed: false, output: `❌ Тесты не пройдены:\n${result.stdout}`, charCount });
        toast({ title: "Тесты не пройдены", status: "error" });
      }
    } catch (error: any) {
      setTestResults({ passed: false, output: `❌ Ошибка:\n${error.message}`, charCount: 0 });
      toast({ title: "Ошибка", status: "error" });
    } finally {
      setIsChecking(false);
    }
  };

  const selectChallenge = (challenge: GolfChallenge) => {
    setSelectedChallenge(challenge);
    setCode(`# ${challenge.title}\n# Пар: ${challenge.par} символов\n\n`);
    setTestResults(null);
  };

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
            🎮 Code Golf
          </Heading>
        </HStack>
        <Badge colorScheme="purple" fontSize="md">
          Минимум символов = Победа!
        </Badge>
      </HStack>

      {!selectedChallenge ? (
        /* Challenge Selection */
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {GOLF_CHALLENGES.map((challenge) => (
            <Card
              key={challenge.id}
              bg="rgba(255,255,255,0.05)"
              borderRadius="xl"
              cursor="pointer"
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
              onClick={() => selectChallenge(challenge)}
            >
              <CardBody>
                <VStack align="start" spacing={3}>
                  <HStack justify="space-between" w="full">
                    <Text color="white" fontWeight="bold" fontSize="lg">
                      {challenge.title}
                    </Text>
                    <Badge colorScheme={challenge.difficulty === "easy" ? "green" : "yellow"}>
                      {challenge.difficulty === "easy" ? "Легкий" : "Средний"}
                    </Badge>
                  </HStack>
                  <Text color="gray.400" fontSize="sm" noOfLines={2}>
                    {challenge.description}
                  </Text>
                  <HStack spacing={4}>
                    <Stat>
                      <StatLabel color="gray.500">Пар</StatLabel>
                      <StatNumber color="yellow.400">{challenge.par}</StatNumber>
                    </Stat>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        /* Challenge */
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <VStack spacing={4} align="stretch">
            <Card bg="rgba(255,255,255,0.05)" borderRadius="xl">
              <CardBody>
                <VStack align="start" spacing={3}>
                  <HStack justify="space-between" w="full">
                    <Heading fontSize="xl" color="white">
                      {selectedChallenge.title}
                    </Heading>
                    <Button
                      size="sm"
                      bg="rgba(255,255,255,0.1)"
                      color="white"
                      _hover={{ bg: "rgba(255,255,255,0.2)" }}
                      onClick={() => setSelectedChallenge(null)}
                    >
                      Выбрать другое
                    </Button>
                  </HStack>
                  <Text color="gray.300">{selectedChallenge.description}</Text>
                  <HStack spacing={4}>
                    <Badge colorScheme="yellow">Пар: {selectedChallenge.par} символов</Badge>
                    {testResults && (
                      <Badge colorScheme={testResults.passed ? "green" : "red"}>
                        {testResults.charCount} символов
                      </Badge>
                    )}
                  </HStack>
                </VStack>
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

            <Box>
              <Text color="white" fontWeight="bold" mb={2}>
                Ваш код ({code.replace(/\s/g, "").length} символов без пробелов):
              </Text>
              <Editor
                height="300px"
                theme="vs-dark"
                language="python"
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
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
              leftIcon={<Icon as={FiCheckCircle} />}
            >
              Проверить решение
            </Button>
          </VStack>

          {/* Leaderboard */}
          <VStack spacing={4} align="stretch">
            <Heading fontSize="xl" color="white">
              🏆 Таблица лидеров
            </Heading>
            {submissions.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {submissions.map((sub, index) => (
                  <Card
                    key={sub.id}
                    bg={index === 0 ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.05)"}
                    borderRadius="xl"
                  >
                    <CardBody>
                      <HStack justify="space-between">
                        <HStack spacing={3}>
                          <Text fontSize="xl" fontWeight="bold" color={index === 0 ? "yellow.400" : "gray.400"}>
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                          </Text>
                          <Text color="white" fontWeight="bold">{sub.userName}</Text>
                        </HStack>
                        <Badge colorScheme="purple">{sub.charCount} символов</Badge>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            ) : (
              <Box bg="rgba(255,255,255,0.05)" borderRadius="xl" p={10} textAlign="center">
                <Icon as={FiAward} w={16} h={16} color="gray.600" mb={4} />
                <Text color="gray.400">Пока нет решений</Text>
                <Text color="gray.500" fontSize="sm" mt={2}>Будьте первым!</Text>
              </Box>
            )}
          </VStack>
        </SimpleGrid>
      )}
    </Box>
  );
}
