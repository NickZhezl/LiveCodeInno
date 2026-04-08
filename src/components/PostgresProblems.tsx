import { useState } from "react";
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
  Card,
  CardBody,
} from "@chakra-ui/react";
import { FiCheckCircle, FiXCircle, FiDatabase } from "react-icons/fi";
import { Editor } from "@monaco-editor/react";
import { PostgresProblem } from "../data/postgresProblems";

interface PostgresProblemsProps {
  problems: PostgresProblem[];
  onBack: () => void;
}

export default function PostgresProblems({ problems, onBack }: PostgresProblemsProps) {
  const [selectedProblemId, setSelectedProblemId] = useState<string>("");
  const [code, setCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; output: string } | null>(null);
  const toast = useToast();

  const selectedProblem = problems.find((p) => p.id === selectedProblemId);

  const handleProblemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const problemId = e.target.value;
    const problem = problems.find((p) => p.id === problemId);
    if (problem) {
      setSelectedProblemId(problemId);
      setCode(problem.starterCode);
      setTestResults(null);
    }
  };

  const checkSolution = async () => {
    if (!selectedProblem) {
      toast({ title: "Выберите задачу", status: "warning" });
      return;
    }

    setIsChecking(true);
    setTestResults(null);

    try {
      // For now, just compare the user's code with expected output
      // In a real implementation, you'd execute the SQL and compare results
      const userCode = code.trim().toLowerCase().replace(/\s+/g, " ");

      // Simple check - if user's code contains key parts of solution
      const passed = userCode.includes("select") && userCode.includes("from");

      if (passed) {
        setTestResults({ passed: true, output: "✅ Задача решена!" });
        toast({ title: "Задача решена!", status: "success" });
      } else {
        setTestResults({
          passed: false,
          output: `❌ Решение не совсем верное.\n\nОжидалось:\n${selectedProblem.solutionCode}`,
        });
        toast({ title: "Попробуйте ещё раз", status: "error" });
      }
    } catch (error) {
      console.error("Error checking solution:", error);
      toast({ title: "Ошибка проверки", status: "error" });
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
              <Icon as={FiDatabase} mr={2} />
              Задачи по PostgreSQL
            </Heading>
          </HStack>
          <Badge colorScheme="blue" fontSize="md" px={4} py={2} borderRadius="full">
            {problems.length} задач
          </Badge>
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
              {problems.map((problem) => (
                <option key={problem.id} value={problem.id} style={{ backgroundColor: "#2D3748", color: "white" }}>
                  {problem.title} (Уровень {problem.level})
                </option>
              ))}
            </Select>

            <VStack spacing={2} align="stretch" maxH="600px" overflowY="auto">
              {problems.map((problem) => (
                <Card
                  key={problem.id}
                  bg={selectedProblemId === problem.id ? "rgba(59, 130, 246, 0.2)" : "rgba(255,255,255,0.05)"}
                  borderRadius="xl"
                  cursor="pointer"
                  _hover={{ bg: "rgba(255,255,255,0.1)" }}
                  onClick={() => {
                    setSelectedProblemId(problem.id);
                    setCode(problem.starterCode);
                    setTestResults(null);
                  }}
                >
                  <CardBody>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium" fontSize="sm" color="white">
                          {problem.title}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {problem.category}
                        </Text>
                      </VStack>
                      <Badge colorScheme={difficultyColors[problem.level as keyof typeof difficultyColors] as any}>
                        {problem.level}
                      </Badge>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </VStack>
        </Box>

        {/* Editor & Results */}
        <Box flex={2}>
          {selectedProblem ? (
            <VStack spacing={4} align="stretch">
              <Box>
                <HStack spacing={2} mb={2}>
                  <Heading fontSize="xl" color="white">{selectedProblem.title}</Heading>
                  <Badge colorScheme={difficultyColors[selectedProblem.level as keyof typeof difficultyColors] as any}>
                    Уровень {selectedProblem.level}
                  </Badge>
                </HStack>
                <Text color="gray.400">{selectedProblem.description}</Text>
              </Box>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text color="white" fontWeight="bold">Редактор SQL:</Text>
                  <Button
                    colorScheme="blue"
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
                  language="sql"
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
                      {testResults.passed ? "Задача решена!" : "Попробуйте ещё раз"}
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
                    whiteSpace="pre-wrap"
                  >
                    {testResults.output}
                  </Box>
                </Box>
              )}
            </VStack>
          ) : (
            <Box h="full" display="flex" alignItems="center" justifyContent="center" color="gray.500">
              <VStack spacing={4}>
                <Icon as={FiDatabase} w={16} h={16} />
                <Text>Выберите задачу для выполнения</Text>
              </VStack>
            </Box>
          )}
        </Box>
      </HStack>
    </Box>
  );
}
