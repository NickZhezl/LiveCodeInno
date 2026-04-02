import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Card,
  CardBody,
  Progress,
  Icon,
} from "@chakra-ui/react";
import { FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";
import { firestore } from "../../main";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";

interface UserProgress {
  uid: string;
  email: string;
  displayName: string;
  completedHomework: number;
  totalAttempts: number;
  successRate: number;
  lastActive: Date;
}

interface UserProgressPanelProps {
  onBack: () => void;
}

export default function UserProgressPanel({ onBack }: UserProgressPanelProps) {
  const [users, setUsers] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchUserProgress();
  }, []);

  async function fetchUserProgress() {
    try {
      // Get all users
      const usersRef = collection(firestore, "users");
      const usersSnapshot = await getDocs(usersRef);
      
      const usersData: UserProgress[] = [];
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        
        // Get user's homework progress
        let completedHomework = 0;
        
        try {
          const progressRef = collection(firestore, "users", userDoc.id, "progress", "homework");
          const progressSnapshot = await getDocs(progressRef);
          
          progressSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.completedTasks) {
              completedHomework = data.completedTasks.length;
            }
          });
        } catch (e) {
          // User has no progress yet
        }
        
        // Get submissions for more detailed stats
        const submissionsRef = collection(firestore, "submissions");
        const submissionsQuery = query(submissionsRef, orderBy("timestamp", "desc"));
        const submissionsSnapshot = await getDocs(submissionsQuery);
        
        let userSubmissions = 0;
        let userPassed = 0;
        
        submissionsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userId === userDoc.id) {
            userSubmissions++;
            if (data.passed) userPassed++;
          }
        });
        
        usersData.push({
          uid: userDoc.id,
          email: userData.email || "",
          displayName: userData.displayName || "",
          completedHomework,
          totalAttempts: userSubmissions,
          successRate: userSubmissions > 0 ? Math.round((userPassed / userSubmissions) * 100) : 0,
          lastActive: userData.createdAt?.toDate() || new Date(),
        });
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      toast({ title: "Ошибка загрузки прогресса", status: "error" });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="#0f0a19" display="flex" alignItems="center" justifyContent="center">
        <Text color="white">Загрузка...</Text>
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
            <Heading fontSize="2xl" color="white">Прогресс пользователей</Heading>
          </HStack>
          <Button onClick={logout} bg="rgba(255,255,255,0.1)" color="white" _hover={{ bg: "rgba(255,255,255,0.2)" }} size="sm">
            Выйти
          </Button>
        </HStack>
      </Box>

      <Box p={6}>
        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Stat bg="rgba(255,255,255,0.05)" p={6} borderRadius="xl">
            <StatLabel color="gray.400">Всего пользователей</StatLabel>
            <StatNumber color="white" fontSize="3xl">{users.length}</StatNumber>
          </Stat>
          <Stat bg="rgba(255,255,255,0.05)" p={6} borderRadius="xl">
            <StatLabel color="gray.400">Выполнено ДЗ</StatLabel>
            <StatNumber color="green.400" fontSize="3xl">
              {users.reduce((sum, u) => sum + u.completedHomework, 0)}
            </StatNumber>
          </Stat>
          <Stat bg="rgba(255,255,255,0.05)" p={6} borderRadius="xl">
            <StatLabel color="gray.400">Всего попыток</StatLabel>
            <StatNumber color="purple.400" fontSize="3xl">{users.reduce((sum, u) => sum + u.totalAttempts, 0)}</StatNumber>
          </Stat>
        </SimpleGrid>

        {/* Users Table */}
        <Card bg="rgba(255,255,255,0.05)" borderRadius="xl">
          <CardBody>
            <Table variant="simple" colorScheme="gray">
              <Thead>
                <Tr>
                  <Th color="gray.400">Пользователь</Th>
                  <Th color="gray.400">Выполнено ДЗ</Th>
                  <Th color="gray.400">Всего попыток</Th>
                  <Th color="gray.400">Успешность</Th>
                  <Th color="gray.400">Прогресс</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => (
                  <Tr key={user.uid}>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text color="white" fontWeight="bold">{user.displayName}</Text>
                        <Text fontSize="sm" color="gray.500">{user.email}</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
                        {user.completedHomework} / 9
                      </Badge>
                    </Td>
                    <Td color="gray.300">{user.totalAttempts}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Icon as={user.successRate >= 80 ? FiCheckCircle : user.successRate >= 50 ? FiClock : FiXCircle} 
                          color={user.successRate >= 80 ? "green.400" : user.successRate >= 50 ? "yellow.400" : "red.400"} />
                        <Text color={user.successRate >= 80 ? "green.400" : user.successRate >= 50 ? "yellow.400" : "red.400"}>
                          {user.successRate}%
                        </Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Progress 
                        value={(user.completedHomework / 9) * 100} 
                        size="sm" 
                        colorScheme={user.completedHomework >= 5 ? "green" : user.completedHomework >= 2 ? "yellow" : "red"}
                        borderRadius="full"
                        w="150px"
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}
