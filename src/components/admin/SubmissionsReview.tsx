import { useState, useEffect } from "react";
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
  SimpleGrid,
} from "@chakra-ui/react";
import { FiCheckCircle, FiXCircle, FiClock, FiEye } from "react-icons/fi";
import { firestore } from "../../main";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

interface Submission {
  id: string;
  userId: string;
  userName: string;
  taskId: string;
  taskTitle: string;
  code: string;
  output: string;
  expectedOutput: string;
  passed: boolean;
  status: "completed" | "failed";
  timestamp: Date;
  assignmentId: string;
}

interface SubmissionsReviewProps {
  onBack: () => void;
}

export default function SubmissionsReview({ onBack }: SubmissionsReviewProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  
  const toast = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    try {
      setLoading(true);
      
      // Get all submissions
      const submissionsRef = collection(firestore, "submissions");
      const submissionsQuery = query(submissionsRef, where("status", "==", "completed"));
      const submissionsSnapshot = await getDocs(submissionsQuery);
      
      const subsData: Submission[] = [];
      const userIds = new Set<string>();
      
      submissionsSnapshot.forEach((doc) => {
        const data = doc.data();
        subsData.push({
          id: doc.id,
          userId: data.userId,
          taskId: data.taskId,
          assignmentId: data.assignmentId,
          code: data.code,
          output: data.output || "",
          expectedOutput: data.expectedOutput || "",
          passed: data.passed,
          status: data.status,
          timestamp: data.timestamp?.toDate() || new Date(),
          taskTitle: data.taskId,
          userName: data.userId,
        });
        userIds.add(data.userId);
      });
      
      // Get user names
      const usersRef = collection(firestore, "users");
      const usersSnapshot = await getDocs(usersRef);
      const usersMap: Record<string, string> = {};
      usersSnapshot.forEach((doc) => {
        usersMap[doc.id] = doc.data().displayName || doc.data().email || "Unknown";
      });
      
      // Get task titles
      const tasksRef = collection(firestore, "customHomework");
      const tasksSnapshot = await getDocs(tasksRef);
      const tasksMap: Record<string, any> = {};
      tasksSnapshot.forEach((doc) => {
        tasksMap[doc.id] = doc.data();
      });
      
      // Update submission data with names and titles
      const updatedSubs = subsData.map(sub => ({
        ...sub,
        userName: usersMap[sub.userId] || "Unknown",
        taskTitle: tasksMap[sub.taskId]?.title || sub.taskId,
      }));
      
      setSubmissions(updatedSubs);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({ title: "Ошибка загрузки", status: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function approveSubmission(submission: Submission) {
    try {
      // Update assignment status
      const assignmentRef = doc(firestore, "assignments", submission.assignmentId);
      await updateDoc(assignmentRef, {
        status: "completed",
        approvedAt: new Date(),
        approvedBy: "admin",
      });
      
      // Update user progress
      const userProgressRef = doc(firestore, "users", submission.userId, "progress", "homework");
      await updateDoc(userProgressRef, {
        completedTasks: Array.isArray(submission.taskId) ? submission.taskId : [submission.taskId],
      }).catch(() => {}); // Ignore if doesn't exist
      
      toast({ title: "Задание одобрено!", status: "success" });
      fetchSubmissions();
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Error approving:", error);
      toast({ title: "Ошибка одобрения", status: "error" });
    }
  }

  async function rejectSubmission(submission: Submission) {
    try {
      const assignmentRef = doc(firestore, "assignments", submission.assignmentId);
      await updateDoc(assignmentRef, {
        status: "failed",
        rejectedAt: new Date(),
        rejectedBy: "admin",
      });
      
      toast({ title: "Задание отклонено", status: "warning" });
      fetchSubmissions();
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Error rejecting:", error);
      toast({ title: "Ошибка отклонения", status: "error" });
    }
  }

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
            <Heading fontSize="2xl" color="white">Проверка работ</Heading>
          </HStack>
          <Badge colorScheme="purple" fontSize="md" px={4} py={2} borderRadius="full">
            {submissions.length} работ
          </Badge>
        </HStack>
      </Box>

      <HStack align="flex-start" p={6} spacing={6}>
        {/* Submissions List */}
        <Box flex={1} maxW="400px">
          <VStack spacing={3} align="stretch">
            {submissions.length === 0 ? (
              <Box p={6} textAlign="center" color="gray.500">
                <Icon as={FiClock} w={12} h={12} mx="auto" mb={4} />
                <Text>Нет работ на проверку</Text>
              </Box>
            ) : (
              submissions.map(sub => (
                <Card
                  key={sub.id}
                  bg={selectedSubmission?.id === sub.id ? "purple.900" : "rgba(255,255,255,0.05)"}
                  borderRadius="xl"
                  p={4}
                  cursor="pointer"
                  _hover={{ bg: "rgba(255,255,255,0.1)" }}
                  onClick={() => setSelectedSubmission(sub)}
                >
                  <HStack justify="space-between" mb={2}>
                    <Text color="white" fontWeight="bold" fontSize="sm">{sub.taskTitle}</Text>
                    <Badge colorScheme="yellow" fontSize="xs">
                      <Icon as={FiClock} w={3} h={3} />
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.300" mb={1}>{sub.userName}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {sub.timestamp.toLocaleDateString()} {sub.timestamp.toLocaleTimeString()}
                  </Text>
                </Card>
              ))
            )}
          </VStack>
        </Box>

        {/* Review Panel */}
        <Box flex={2}>
          {selectedSubmission ? (
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Box>
                  <Heading fontSize="xl" color="white" mb={2}>{selectedSubmission.taskTitle}</Heading>
                  <HStack spacing={2}>
                    <Text color="gray.400">Студент:</Text>
                    <Badge colorScheme="blue">{selectedSubmission.userName}</Badge>
                    <Text color="gray.400">Отправлено:</Text>
                    <Badge colorScheme="gray">
                      {selectedSubmission.timestamp.toLocaleString()}
                    </Badge>
                  </HStack>
                </Box>
              </HStack>

              <Card bg="rgba(255,255,255,0.05)" borderRadius="xl" p={4}>
                <Text color="white" fontWeight="bold" mb={2}>Код студента:</Text>
                <Box
                  as="pre"
                  bg="rgba(0,0,0,0.3)"
                  p={3}
                  borderRadius="md"
                  color="gray.200"
                  fontSize="sm"
                  fontFamily="mono"
                  maxH="300px"
                  overflowY="auto"
                >
                  {selectedSubmission.code}
                </Box>
              </Card>

              <SimpleGrid columns={2} spacing={4}>
                <Card bg="rgba(0,255,0,0.1)" borderRadius="xl" p={4} border="1px solid green">
                  <Text color="green.400" fontWeight="bold" mb={2}>Ожидаемый вывод:</Text>
                  <Box
                    as="pre"
                    bg="rgba(0,0,0,0.3)"
                    p={3}
                    borderRadius="md"
                    color="green.200"
                    fontSize="sm"
                    fontFamily="mono"
                  >
                    {selectedSubmission.expectedOutput}
                  </Box>
                </Card>

                <Card bg="rgba(255,255,0,0.1)" borderRadius="xl" p={4} border="1px solid yellow">
                  <Text color="yellow.400" fontWeight="bold" mb={2}>Вывод студента:</Text>
                  <Box
                    as="pre"
                    bg="rgba(0,0,0,0.3)"
                    p={3}
                    borderRadius="md"
                    color="yellow.200"
                    fontSize="sm"
                    fontFamily="mono"
                  >
                    {selectedSubmission.output}
                  </Box>
                </Card>
              </SimpleGrid>

              <HStack spacing={4}>
                <Button
                  leftIcon={<Icon as={FiCheckCircle} />}
                  bg="green.600"
                  color="white"
                  _hover={{ bg: "green.700" }}
                  onClick={() => approveSubmission(selectedSubmission)}
                >
                  Одобрить
                </Button>
                <Button
                  leftIcon={<Icon as={FiXCircle} />}
                  bg="red.600"
                  color="white"
                  _hover={{ bg: "red.700" }}
                  onClick={() => rejectSubmission(selectedSubmission)}
                >
                  Отклонить
                </Button>
              </HStack>
            </VStack>
          ) : (
            <Box h="full" display="flex" alignItems="center" justifyContent="center" color="gray.500">
              <VStack spacing={4}>
                <Icon as={FiEye} w={16} h={16} />
                <Text>Выберите работу для проверки</Text>
              </VStack>
            </Box>
          )}
        </Box>
      </HStack>
    </Box>
  );
}
