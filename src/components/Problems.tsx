import { useState, useRef, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Badge,
  Select,
  useToast,
  Icon,
} from "@chakra-ui/react";
import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from "react-icons/fi";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { PROBLEMS_BANK } from "../data/problemsBank";
import { executeCode } from "../utils/codeExecutor";

interface ProblemsProps {
  onBack: () => void;
}

export default function Problems({ onBack }: ProblemsProps) {
  const [selectedProblemId, setSelectedProblemId] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; output: string; details: Array<{ input: string; expected: string; actual: string; passed: boolean }> } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerActive, setTimerActive] = useState(false);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const toast = useToast();

  const selectedProblem = PROBLEMS_BANK.find(p => p.id === selectedProblemId);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (timeLeft <= 10) {
          toast({
            title: "Время истекает!",
            status: "warning",
            duration: 2000,
          });
        }
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      toast({
        title: "Время вышло!",
        status: "error",
        duration: 3000,
      });
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, toast]);

  const handleProblemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const problemId = e.target.value;
    const problem = PROBLEMS_BANK.find(p => p.id === problemId);
    if (problem) {
      setSelectedProblemId(problemId);
      setCode(problem.starterCode);
      setTestResults(null);
      setTimeLeft(problem.timeLimit);
      setTimerActive(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const checkSolution = async () => {
    if (!selectedProblem) {
      toast({ title: "Выберите задачу", status: "warning" });
      return;
    }

    setIsChecking(true);
    setTestResults(null);

    try {
      const details: Array<{ input: string; expected: string; actual: string; passed: boolean }> = [];
      let allPassed = true;

      // Run each test case
      for (const testCase of selectedProblem.testCases || []) {
        const testCode = `${code}\n\n# Test\nprint(${selectedProblem.id.split("-")[0]}_${selectedProblem.id.split("-")[1]}(${testCase.input}))`;
        const result = await executeCode("python", testCode);
        
        let actual = "";
        if (result.run.stderr) {
          actual = `Error: ${result.run.stderr}`;
          allPassed = false;
        } else {
          actual = result.run.stdout.trim();
          const passed = actual === testCase.expected;
          if (!passed) allPassed = false;
        }

        details.push({
          input: testCase.input,
          expected: testCase.expected,
          actual,
          passed: actual === testCase.expected,
        });
      }

      setTestResults({
        passed: allPassed,
        output: allPassed ? "Все тесты пройдены!" : "Некоторые тесты не пройдены",
        details,
      });

      toast({
        title: allPassed ? "Задача решена!" : "Есть ошибки",
        status: allPassed ? "success" : "error",
      });

      if (allPassed) {
        setTimerActive(false);
      }
    } catch (error) {
      toast({ title: "Ошибка сети", status: "error" });
    } finally {
      setIsChecking(false);
    }
  };

  const difficultyColors = {
    easy: "green",
    medium: "yellow",
    hard: "red",
  };

  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500">
      {/* Header */}
      <Box p={6} borderBottom="1px solid rgba(255,255,255,0.1)">
        <HStack justify="space-between">
          <HStack spacing={4}>
            <Button onClick={onBack} bg="rgba(255,255,255,0.1)" color="white" _hover={{ bg: "rgba(255,255,255,0.2)" }} size="sm">
              ← Назад
            </Button>
            <Heading fontSize="2xl" color="white">Банк задач</Heading>
          </HStack>
          <HStack spacing={4}>
            {timerActive && (
              <HStack bg={timeLeft <= 60 ? "red.900" : "rgba(255,255,255,0.1)"} px={4} py={2} borderRadius="full">
                <Icon as={FiClock} w={5} h={5} color={timeLeft <= 60 ? "red.400" : "gray.400"} />
                <Text fontWeight="bold" color={timeLeft <= 60 ? "red.400" : "white"}>
                  {formatTime(timeLeft)}
                </Text>
              </HStack>
            )}
            <Badge colorScheme="purple" fontSize="md" px={4} py={2} borderRadius="full">
              {PROBLEMS_BANK.length} задач
            </Badge>
          </HStack>
        </HStack>
      </Box>

      <HStack align="flex-start" p={6} spacing={6}>
        {/* Problem List */}
        <Box flex={1} maxW="400px">
          <VStack spacing={3} align="stretch">
            <Select
              placeholder="Выберите задачу..."
              bg="gray.800"
              color="white"
              borderColor="gray.600"
              onChange={handleProblemSelect}
              value={selectedProblemId}
            >
              {PROBLEMS_BANK.map(problem => (
                <option key={problem.id} value={problem.id} style={{ backgroundColor: "#2D3748", color: "white" }}>
                  {problem.title} ({problem.difficulty})
                </option>
              ))}
            </Select>

            <VStack spacing={2} align="stretch" maxH="600px" overflowY="auto">
              {PROBLEMS_BANK.map(problem => (
                <Button
                  key={problem.id}
                  onClick={() => {
                    setSelectedProblemId(problem.id);
                    setCode(problem.starterCode);
                    setTestResults(null);
                    setTimeLeft(problem.timeLimit);
                    setTimerActive(true);
                  }}
                  bg={selectedProblemId === problem.id ? "purple.600" : "rgba(255,255,255,0.05)"}
                  color={selectedProblemId === problem.id ? "white" : "gray.400"}
                  _hover={{ bg: selectedProblemId === problem.id ? "purple.700" : "rgba(255,255,255,0.1)" }}
                  justifyContent="space-between"
                  px={4}
                  py={4}
                  borderRadius="lg"
                >
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium" fontSize="sm">{problem.title}</Text>
                    <Text fontSize="xs" color="gray.500">{problem.category}</Text>
                  </VStack>
                  <Badge colorScheme={difficultyColors[problem.difficulty as keyof typeof difficultyColors] as any}>
                    {problem.difficulty === "easy" ? "Легко" : problem.difficulty === "medium" ? "Средне" : "Сложно"}
                  </Badge>
                </Button>
              ))}
            </VStack>
          </VStack>
        </Box>

        {/* Editor & Results */}
        <Box flex={2}>
          {selectedProblem ? (
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Box>
                  <HStack spacing={2} mb={2}>
                    <Heading fontSize="xl" color="white">{selectedProblem.title}</Heading>
                    <Badge colorScheme={difficultyColors[selectedProblem.difficulty as keyof typeof difficultyColors] as any}>
                      {selectedProblem.difficulty === "easy" ? "Легко" : selectedProblem.difficulty === "medium" ? "Средне" : "Сложно"}
                    </Badge>
                  </HStack>
                  <Text color="gray.400">{selectedProblem.description}</Text>
                </Box>
                <Button
                  colorScheme="green"
                  onClick={checkSolution}
                  isLoading={isChecking}
                  loadingText="Проверка..."
                  leftIcon={testResults?.passed ? <FiCheckCircle /> : undefined}
                >
                  Проверить
                </Button>
              </HStack>

              <HStack spacing={6}>
                <Box flex={1} p={4} bg="rgba(255,255,255,0.05)" borderRadius="lg">
                  <Text color="white" fontWeight="bold" mb={2}>Входные данные:</Text>
                  <Text color="gray.300">{selectedProblem.input}</Text>
                </Box>
                <Box flex={1} p={4} bg="rgba(255,255,255,0.05)" borderRadius="lg">
                  <Text color="white" fontWeight="bold" mb={2}>Выходные данные:</Text>
                  <Text color="gray.300">{selectedProblem.output}</Text>
                </Box>
              </HStack>

              {selectedProblem.examples.length > 0 && (
                <Box p={4} bg="rgba(255,255,255,0.05)" borderRadius="lg">
                  <Text color="white" fontWeight="bold" mb={2}>Примеры:</Text>
                  <VStack align="stretch" spacing={2}>
                    {selectedProblem.examples.map((ex, i) => (
                      <HStack key={i} spacing={4}>
                        <Badge colorScheme="blue">Пример {i + 1}</Badge>
                        <Text color="gray.300">Вход: <Box as="code" bg="rgba(0,0,0,0.3)" px={2} py={1} borderRadius="md">{ex.input}</Box></Text>
                        <Text color="gray.300">Выход: <Box as="code" bg="rgba(0,0,0,0.3)" px={2} py={1} borderRadius="md">{ex.output}</Box></Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}

              <Box>
                <Editor
                  height="300px"
                  theme="vs-dark"
                  language="python"
                  value={code}
                  onChange={(val) => setCode(val || "")}
                  onMount={(editor) => { editorRef.current = editor; }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                  }}
                />
              </Box>

              {testResults && (
                <Box
                  p={4}
                  borderRadius="lg"
                  bg={testResults.passed ? "green.900" : "red.900"}
                  borderLeft={`4px solid ${testResults.passed ? "green" : "red"}`}
                >
                  <HStack spacing={2} mb={3}>
                    <Icon as={testResults.passed ? FiCheckCircle : FiXCircle} w={5} h={5} color="white" />
                    <Text fontWeight="bold" color="white">
                      {testResults.output}
                    </Text>
                  </HStack>
                  <VStack align="stretch" spacing={2}>
                    {testResults.details.map((detail, i) => (
                      <HStack key={i} spacing={2} bg="rgba(0,0,0,0.2)" p={2} borderRadius="md">
                        <Icon as={detail.passed ? FiCheckCircle : FiXCircle} w={4} h={4} color={detail.passed ? "green.400" : "red.400"} />
                        <Text fontSize="sm" color="gray.300">Вход: <Box as="code">{detail.input}</Box></Text>
                        {!detail.passed && (
                          <>
                            <Text fontSize="sm" color="gray.300">Ожидалось: <Box as="code">{detail.expected}</Box></Text>
                            <Text fontSize="sm" color="gray.300">Получено: <Box as="code">{detail.actual}</Box></Text>
                          </>
                        )}
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          ) : (
            <Box h="full" display="flex" alignItems="center" justifyContent="center" color="gray.500">
              <VStack spacing={4}>
                <Icon as={FiAlertCircle} w={16} h={16} />
                <Text>Выберите задачу для решения</Text>
              </VStack>
            </Box>
          )}
        </Box>
      </HStack>
    </Box>
  );
}
