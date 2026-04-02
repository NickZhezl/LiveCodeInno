import { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Badge,
  useToast,
  Card,
  Icon,
  Spinner,
} from "@chakra-ui/react";
import { FiCheckCircle, FiXCircle, FiBook } from "react-icons/fi";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { firestore } from "../main";
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { executeCode } from "../utils/codeExecutor";

interface AssignedTask {
  id: string;
  taskId: string;
  title: string;
  category: string;
  level: number;
  description: string;
  task: string;
  starterCode: string;
  expectedOutput: string;
  status: "pending" | "completed" | "submitted" | "failed";
  assignedAt: Date;
  completedAt?: Date;
}

interface MyHomeworkProps {
  onBack: () => void;
}

export default function MyHomework({ onBack }: MyHomeworkProps) {
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<AssignedTask | null>(null);
  const [code, setCode] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { userData } = useAuth();
  const toast = useToast();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (userData) {
      fetchAssignedTasks();
    }
  }, [userData]);

  async function fetchAssignedTasks() {
    if (!userData) return;
    
    try {
      setLoading(true);
      
      // Get assignments for this user
      const assignmentsRef = collection(firestore, "assignments");
      const assignmentsQuery = query(assignmentsRef, where("userId", "==", userData.uid));
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      
      const tasks: AssignedTask[] = [];
      
      for (const assignmentDoc of assignmentsSnapshot.docs) {
        const assignmentData = assignmentDoc.data();
        
        // Get the actual homework task
        const taskDoc = await getDocs(query(collection(firestore, "customHomework"), where("__name__", "==", assignmentData.taskId)));
        
        if (!taskDoc.empty) {
          const taskData = taskDoc.docs[0].data();
          tasks.push({
            id: assignmentDoc.id,
            taskId: assignmentData.taskId,
            title: taskData.title,
            category: taskData.category,
            level: taskData.level,
            description: taskData.description,
            task: taskData.task,
            starterCode: taskData.starterCode,
            expectedOutput: taskData.expectedOutput || "",
            status: assignmentData.status,
            assignedAt: assignmentData.assignedAt?.toDate() || new Date(),
            completedAt: assignmentData.completedAt?.toDate(),
          });
        }
      }
      
      setAssignedTasks(tasks);
    } catch (error) {
      console.error("Error fetching assigned tasks:", error);
      toast({ title: "Ошибка загрузки заданий", status: "error" });
    } finally {
      setLoading(false);
    }
  }

  const handleSelectTask = (task: AssignedTask) => {
    setSelectedTask(task);
    setCode(task.starterCode);
  };

  const submitSolution = async () => {
    if (!selectedTask || !userData) {
      toast({ title: "Ошибка", status: "error" });
      return;
    }

    setIsChecking(true);

    try {
      // Выполняем код пользователя
      const result = await executeCode("python", code);
      const userOutput = result.run.stdout.trim();
      const expectedOutput = selectedTask.expectedOutput.trim();
      
      // Сравниваем вывод с ожидаемым
      const isPassed = userOutput === expectedOutput;

      // Сохраняем submission
      const submissionRef = doc(collection(firestore, "submissions"));
      await setDoc(submissionRef, {
        userId: userData.uid,
        taskId: selectedTask.taskId,
        assignmentId: selectedTask.id,
        code: code,
        output: userOutput,
        expectedOutput: expectedOutput,
        passed: isPassed,
        status: isPassed ? "completed" : "failed",
        timestamp: serverTimestamp(),
      });

      // Обновляем статус задания
      if (isPassed) {
        const assignmentRef = doc(firestore, "assignments", selectedTask.id);
        await setDoc(assignmentRef, {
          status: "submitted",  // Отправлено админу на проверку
          submittedAt: serverTimestamp(),
          userCode: code,
          userOutput: userOutput,
        }, { merge: true });

        toast({ 
          title: "Решение отправлено!", 
          description: "Администратор проверит и подтвердит выполнение", 
          status: "success" 
        });
        
        fetchAssignedTasks();
      } else {
        toast({ 
          title: "Вывод не совпадает", 
          description: `Ожидалось:\n${expectedOutput}\n\nПолучено:\n${userOutput}`, 
          status: "error",
          duration: 10000,
        });
      }

      setTestResults({ 
        passed: isPassed, 
        output: isPassed ? "Вывод совпадает! Решение отправлено админу." : `Вывод не совпадает.\n\nОжидалось:\n${expectedOutput}\n\nПолучено:\n${userOutput}` 
      });
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({ title: "Ошибка отправки", status: "error" });
    } finally {
      setIsChecking(false);
    }
  };

  const [testResults, setTestResults] = useState<{ passed: boolean; output: string } | null>(null);

  const difficultyColors = {
    1: "green",
    2: "green",
    3: "green",
    4: "yellow",
    5: "yellow",
    6: "yellow",
    7: "orange",
    8: "red",
    9: "red",
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="#0f0a19" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="purple.500" />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500">
      {/* Header */}
      <Box p={6} borderBottom="1px solid rgba(255,255,255,0.1)">
        <HStack justify="space-between">
          <HStack spacing={4}>
            <Button onClick={onBack} bg="rgba(255,255,255,0.1)" color="white" _hover={{ bg: "rgba(255,255,255,0.2)" }} size="sm">
              ← Назад
            </Button>
            <Heading fontSize="2xl" color="white">Мои домашние задания</Heading>
          </HStack>
          <Badge colorScheme="purple" fontSize="md" px={4} py={2} borderRadius="full">
            {assignedTasks.length} заданий
          </Badge>
        </HStack>
      </Box>

      <HStack align="flex-start" p={6} spacing={6}>
        {/* Task List */}
        <Box flex={1} maxW="400px">
          <VStack spacing={3} align="stretch">
            {assignedTasks.length === 0 ? (
              <Box p={6} textAlign="center" color="gray.500">
                <Icon as={FiBook} w={12} h={12} mx="auto" mb={4} />
                <Text>Нет назначенных заданий</Text>
              </Box>
            ) : (
              assignedTasks.map(task => (
                <Card
                  key={task.id}
                  bg={selectedTask?.id === task.id ? "purple.900" : "rgba(255,255,255,0.05)"}
                  borderRadius="xl"
                  p={4}
                  cursor="pointer"
                  _hover={{ bg: "rgba(255,255,255,0.1)" }}
                  onClick={() => handleSelectTask(task)}
                >
                  <HStack justify="space-between" mb={2}>
                    <Text color="white" fontWeight="bold" fontSize="sm">{task.title}</Text>
                    <Badge 
                      colorScheme={task.status === "completed" ? "green" : task.status === "pending" ? "yellow" : "red"}
                      fontSize="xs"
                    >
                      {task.status === "completed" ? "✓" : task.status === "pending" ? "○" : "✗"}
                    </Badge>
                  </HStack>
                  <HStack spacing={2} mb={2}>
                    <Badge colorScheme={difficultyColors[task.level as keyof typeof difficultyColors] as any} fontSize="xs">
                      Уровень {task.level}
                    </Badge>
                    <Badge colorScheme="gray" fontSize="xs">{task.category}</Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    Назначено: {task.assignedAt.toLocaleDateString()}
                  </Text>
                  {task.completedAt && (
                    <Text fontSize="xs" color="green.400">
                      Выполнено: {task.completedAt.toLocaleDateString()}
                    </Text>
                  )}
                </Card>
              ))
            )}
          </VStack>
        </Box>

        {/* Editor & Details */}
        <Box flex={2}>
          {selectedTask ? (
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Box>
                  <HStack spacing={2} mb={2}>
                    <Heading fontSize="xl" color="white">{selectedTask.title}</Heading>
                    <Badge colorScheme={selectedTask.status === "completed" ? "green" : "yellow"}>
                      {selectedTask.status === "completed" ? "Выполнено" : "В работе"}
                    </Badge>
                  </HStack>
                  <Text color="gray.400">{selectedTask.description}</Text>
                </Box>
                {selectedTask.status !== "completed" && (
                  <Button
                    colorScheme="green"
                    onClick={submitSolution}
                    isLoading={isChecking}
                    loadingText="Проверка..."
                    leftIcon={<FiCheckCircle />}
                  >
                    Отправить решение
                  </Button>
                )}
              </HStack>

              <Box p={4} bg="rgba(255,255,255,0.05)" borderRadius="lg">
                <Text color="white" fontWeight="bold" mb={2}>Задание:</Text>
                <Box as="ul" pl={6} color="gray.300">
                  {selectedTask.task.split("\n").map((line, i) => (
                    <Box as="li" key={i}>{line}</Box>
                  ))}
                </Box>
              </Box>

              <Box>
                <Text color="white" fontWeight="bold" mb={2}>Редактор кода:</Text>
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
                  <HStack spacing={2} mb={2}>
                    <Icon as={testResults.passed ? FiCheckCircle : FiXCircle} w={5} h={5} color="white" />
                    <Text fontWeight="bold" color="white">
                      {testResults.passed ? "Тесты пройдены!" : "Тесты не пройдены"}
                    </Text>
                  </HStack>
                  <Box
                    as="pre"
                    bg="rgba(0,0,0,0.3)"
                    p={3}
                    borderRadius="md"
                    color="gray.200"
                    fontSize="sm"
                    maxH="200px"
                    overflowY="auto"
                  >
                    {testResults.output}
                  </Box>
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
