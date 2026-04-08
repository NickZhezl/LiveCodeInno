import { useState, useRef } from "react";
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
import { FiCheckCircle, FiXCircle, FiBook, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { HOMEWORK_TASKS } from "../data/homeworkTasks";
import { executeCode } from "../utils/codeExecutor";
import { runPytest } from "../utils/pytestRunner";
import { useAuth } from "../contexts/AuthContext";
import { firestore } from "../main";
import { doc, setDoc, collection, serverTimestamp, arrayUnion } from "firebase/firestore";

interface HomeworkProps {
  onBack: () => void;
}

export default function Homework({ onBack }: HomeworkProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);
  const [testResults, setTestResults] = useState<{ 
    passed: boolean; 
    output: string;
    pytestResults?: any;
    testDetails?: Array<{name: string; passed: boolean; error?: string}>;
  } | null>(null);
  const [expandedTest, setExpandedTest] = useState<number | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { userData } = useAuth();
  const toast = useToast();

  const selectedTask = HOMEWORK_TASKS.find(t => t.id === selectedTaskId);

  const handleTaskSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const taskId = e.target.value;
    const task = HOMEWORK_TASKS.find(t => t.id === taskId);
    if (task) {
      setSelectedTaskId(taskId);
      setCode(task.starterCode);
      setTestResults(null);
    }
  };

  const checkSolution = async () => {
    if (!selectedTask) {
      toast({ title: "Выберите задание", status: "warning" });
      return;
    }

    if (!userData) {
      toast({ title: "Пользователь не найден", status: "error" });
      return;
    }

    setIsChecking(true);
    setTestResults(null);

    try {
      let passed = false;
      let output = "";
      let testDetails: Array<{name: string; passed: boolean; error?: string}> = [];

      // Check if task has pytest tests
      if (selectedTask.pytestCode) {
        // Use pytest runner
        const pytestResult = await runPytest(code, selectedTask.pytestCode);
        passed = pytestResult.success;
        output = pytestResult.success 
          ? `✅ Все тесты пройдены! (${pytestResult.passed}/${pytestResult.total})`
          : `❌ Тесты не пройдены (${pytestResult.failed}/${pytestResult.total} провалено)`;
        testDetails = pytestResult.tests.map(t => ({
          name: t.name,
          passed: t.passed,
          error: t.error,
        }));
      } else {
        // Fallback to old output comparison method
        const result = await executeCode("python", code);
        const userOutput = result.run.stdout.trim();
        const expectedOutput = (selectedTask as any).expectedOutput?.trim() || "";
        passed = userOutput === expectedOutput;
        output = passed ? "Вывод совпадает!" : `Ожидалось:\n${expectedOutput}\n\nПолучено:\n${userOutput}`;
      }

      // Save progress to Firestore
      const submissionRef = doc(collection(firestore, "submissions"));
      await setDoc(submissionRef, {
        userId: userData.uid,
        taskId: selectedTask.id,
        code: code,
        output: output,
        passed: passed,
        timestamp: serverTimestamp(),
      });

      // Update user progress
      const userProgressRef = doc(firestore, "users", userData.uid, "progress", "homework");
      await setDoc(userProgressRef, {
        completedTasks: passed ? arrayUnion(selectedTask.id) : [],
        attempts: arrayUnion({
          taskId: selectedTask.id,
          passed: passed,
          timestamp: new Date().toISOString(),
        }),
      }, { merge: true });

      setTestResults({ passed, output, testDetails });
      toast({
        title: passed ? "Задание выполнено!" : "Тесты не пройдены",
        status: passed ? "success" : "error",
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast({ title: "Ошибка сохранения", status: "error" });
    } finally {
      setIsChecking(false);
    }
  };

  const difficultyColors = {
    1: "green",
    2: "green",
    3: "green",
    4: "yellow",
    5: "yellow",
    6: "yellow",
    7: "red",
    8: "red",
    9: "red",
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
            <Heading fontSize="2xl" color="white">Домашние задания</Heading>
          </HStack>
          <Badge colorScheme="orange" fontSize="md" px={4} py={2} borderRadius="full">
            {HOMEWORK_TASKS.length} заданий
          </Badge>
        </HStack>
      </Box>

      <HStack align="flex-start" p={6} spacing={6}>
        {/* Task List */}
        <Box flex={1} maxW="400px">
          <VStack spacing={3} align="stretch">
            <Select
              placeholder="Выберите задание..."
              bg="gray.800"
              color="white"
              borderColor="gray.600"
              onChange={handleTaskSelect}
              value={selectedTaskId}
            >
              {HOMEWORK_TASKS.map(task => (
                <option key={task.id} value={task.id} style={{ backgroundColor: "#2D3748", color: "white" }}>
                  {task.title} (Уровень {task.level})
                </option>
              ))}
            </Select>

            <VStack spacing={2} align="stretch" maxH="600px" overflowY="auto">
              {HOMEWORK_TASKS.map(task => (
                <Button
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setCode(task.starterCode);
                    setTestResults(null);
                  }}
                  bg={selectedTaskId === task.id ? "orange.600" : "rgba(255,255,255,0.05)"}
                  color={selectedTaskId === task.id ? "white" : "gray.400"}
                  _hover={{ bg: selectedTaskId === task.id ? "orange.700" : "rgba(255,255,255,0.1)" }}
                  justifyContent="space-between"
                  px={4}
                  py={4}
                  borderRadius="lg"
                >
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium" fontSize="sm">{task.title}</Text>
                    <Text fontSize="xs" color="gray.500">{task.category}</Text>
                  </VStack>
                  <Badge colorScheme={difficultyColors[task.level as keyof typeof difficultyColors] as any}>
                    {task.level}
                  </Badge>
                </Button>
              ))}
            </VStack>
          </VStack>
        </Box>

        {/* Editor & Results */}
        <Box flex={2}>
          {selectedTask ? (
            <VStack spacing={4} align="stretch">
              <Box>
                <HStack spacing={2} mb={2}>
                  <Heading fontSize="xl" color="white">{selectedTask.title}</Heading>
                  <Badge colorScheme={difficultyColors[selectedTask.level as keyof typeof difficultyColors] as any}>
                    Уровень {selectedTask.level}
                  </Badge>
                </HStack>
                <Text color="gray.400">{selectedTask.description}</Text>
              </Box>

              <Box p={4} bg="rgba(255,255,255,0.05)" borderRadius="lg">
                <Text color="white" fontWeight="bold" mb={2}>Задание:</Text>
                <Box as="ul" pl={6} color="gray.300">
                  {selectedTask.task.split("\n").map((line, i) => (
                    <Box as="li" key={i}>{line}</Box>
                  ))}
                </Box>
              </Box>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text color="white" fontWeight="bold">Редактор кода:</Text>
                  <Button
                    colorScheme="green"
                    onClick={checkSolution}
                    isLoading={isChecking}
                    loadingText="Проверка..."
                    leftIcon={testResults?.passed ? <FiCheckCircle /> : undefined}
                  >
                    Проверить решение
                  </Button>
                </HStack>
                <Editor
                  height="400px"
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
                    <Text fontWeight="bold" color="white" fontSize="lg">
                      {testResults.passed ? "✅ Тесты пройдены!" : "❌ Тесты не пройдены"}
                    </Text>
                  </HStack>

                  {/* Show individual test details if available */}
                  {testResults.testDetails && testResults.testDetails.length > 0 && (
                    <VStack spacing={2} align="stretch" mb={3}>
                      <Text color="white" fontWeight="bold" fontSize="sm">
                        Результаты тестов:
                      </Text>
                      {testResults.testDetails.map((test, idx) => (
                        <Box key={idx}>
                          <HStack
                            justify="space-between"
                            p={2}
                            bg={test.passed ? "rgba(0,255,0,0.1)" : "rgba(255,0,0,0.1)"}
                            borderRadius="md"
                            cursor={test.error ? "pointer" : "default"}
                            onClick={() => test.error && setExpandedTest(expandedTest === idx ? null : idx)}
                          >
                            <HStack spacing={2}>
                              <Icon
                                as={test.passed ? FiCheckCircle : FiXCircle}
                                color={test.passed ? "green.400" : "red.400"}
                                w={4}
                                h={4}
                              />
                              <Text color="gray.200" fontSize="sm" fontWeight="medium">
                                {test.name}
                              </Text>
                            </HStack>
                            {test.error && (
                              <Icon
                                as={expandedTest === idx ? FiChevronDown : FiChevronRight}
                                color="gray.400"
                              />
                            )}
                          </HStack>
                          {test.error && expandedTest === idx && (
                            <Box
                              bg="rgba(0,0,0,0.3)"
                              p={3}
                              mt={1}
                              borderRadius="md"
                              fontSize="xs"
                              fontFamily="mono"
                              color="red.300"
                              whiteSpace="pre-wrap"
                              maxH="150px"
                              overflowY="auto"
                            >
                              {test.error}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  )}

                  {/* Legacy output display */}
                  {!testResults.testDetails && (
                    <Box
                      as="pre"
                      bg="rgba(0,0,0,0.3)"
                      p={3}
                      borderRadius="md"
                      color="gray.200"
                      fontSize="sm"
                      maxH="200px"
                      overflowY="auto"
                      whiteSpace="pre-wrap"
                    >
                      {testResults.output}
                    </Box>
                  )}
                </Box>
              )}
            </VStack>
          ) : (
            <Box h="full" display="flex" alignItems="center" justifyContent="center" color="gray.500">
              <VStack spacing={4}>
                <Icon as={FiBook} w={16} h={16} />
                <Text>Выберите задание для выполнения</Text>
              </VStack>
            </Box>
          )}
        </Box>
      </HStack>
    </Box>
  );
}
