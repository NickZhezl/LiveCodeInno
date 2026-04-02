import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Spinner,
  Center,
  Card,
  Icon,
} from "@chakra-ui/react";
import { FiUsers, FiCheckSquare, FiBook } from "react-icons/fi";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../main";
import { useAuth } from "../contexts/AuthContext";
import UserProgressPanel from "../components/admin/UserProgressPanel";
import HomeworkManagement from "../components/admin/HomeworkManagement";
import SubmissionsReview from "../components/admin/SubmissionsReview";
import TopicsManagement from "../components/admin/TopicsManagement";

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: "user" | "admin";
  createdAt: Date;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [activeView, setActiveView] = useState<"dashboard" | "progress" | "homework" | "reviews" | "topics">("dashboard");
  
  const { logout, userData } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Show specific panel views
  if (activeView === "progress") {
    return <UserProgressPanel onBack={() => setActiveView("dashboard")} />;
  }

  if (activeView === "reviews") {
    return <SubmissionsReview onBack={() => setActiveView("dashboard")} />;
  }

  if (activeView === "topics") {
    return <TopicsManagement onBack={() => setActiveView("dashboard")} />;
  }

  if (activeView === "homework") {
    return <HomeworkManagement onBack={() => setActiveView("dashboard")} onOpenReviews={() => setActiveView("reviews")} />;
  }

  async function fetchUsers() {
    try {
      const usersRef = collection(firestore, "users");
      const snapshot = await getDocs(usersRef);
      const usersData: UserData[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
          role: data.role || "user",
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        status: "error",
        title: "Failed to load users",
      });
    } finally {
      setLoadingUsers(false);
    }
  }

  if (loadingUsers) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="purple.500" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500" p={8}>
      <VStack spacing={8} align="stretch" maxW="1400px" mx="auto">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading fontSize="3xl" color="white">
              Admin Dashboard
            </Heading>
            <Text color="gray.400">Welcome back, {userData?.displayName || "Admin"}</Text>
          </VStack>
          <Button
            onClick={logout}
            bg="red.600"
            color="white"
            _hover={{ bg: "red.700" }}
          >
            Logout
          </Button>
        </HStack>

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Stat bg="rgba(255, 255, 255, 0.05)" p={6} borderRadius="xl">
            <HStack justify="space-between" mb={2}>
              <Icon as={FiUsers} w={8} h={8} color="blue.400" />
              <StatNumber color="white" fontSize="3xl">{users.length}</StatNumber>
            </HStack>
            <StatLabel color="gray.400">Пользователей</StatLabel>
            <StatHelpText color="gray.500">
              <Button size="xs" colorScheme="blue" onClick={() => setActiveView("progress")}>
                Прогресс →
              </Button>
            </StatHelpText>
          </Stat>
          <Stat bg="rgba(255, 255, 255, 0.05)" p={6} borderRadius="xl">
            <HStack justify="space-between" mb={2}>
              <Icon as={FiCheckSquare} w={8} h={8} color="orange.400" />
              <StatNumber color="white" fontSize="3xl">9</StatNumber>
            </HStack>
            <StatLabel color="gray.400">Домашних заданий</StatLabel>
            <StatHelpText color="gray.500">
              <Button size="xs" colorScheme="orange" onClick={() => setActiveView("homework")}>
                Управление →
              </Button>
            </StatHelpText>
          </Stat>
          <Stat bg="rgba(255, 255, 255, 0.05)" p={6} borderRadius="xl">
            <HStack justify="space-between" mb={2}>
              <Icon as={FiBook} w={8} h={8} color="green.400" />
              <StatNumber color="white" fontSize="3xl">Темы</StatNumber>
            </HStack>
            <StatLabel color="gray.400">Python</StatLabel>
            <StatHelpText color="gray.500">
              <Button size="xs" colorScheme="green" onClick={() => setActiveView("topics")}>
                Редактор →
              </Button>
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Quick Actions */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={8}>
          <Card
            bg="rgba(255,255,255,0.05)"
            borderRadius="xl"
            p={6}
            cursor="pointer"
            _hover={{ bg: "rgba(255,255,255,0.1)" }}
            onClick={() => setActiveView("progress")}
          >
            <HStack spacing={4} mb={4}>
              <Box w={12} h={12} borderRadius="xl" bg="blue.600" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiUsers} w={6} h={6} color="white" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="xl" fontWeight="bold" color="white">Прогресс пользователей</Text>
                <Text fontSize="sm" color="gray.400">Статистика, выполненные ДЗ, попытки</Text>
              </VStack>
            </HStack>
          </Card>

          <Card
            bg="rgba(255,255,255,0.05)"
            borderRadius="xl"
            p={6}
            cursor="pointer"
            _hover={{ bg: "rgba(255,255,255,0.1)" }}
            onClick={() => setActiveView("homework")}
          >
            <HStack spacing={4} mb={4}>
              <Box w={12} h={12} borderRadius="xl" bg="orange.600" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiCheckSquare} w={6} h={6} color="white" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="xl" fontWeight="bold" color="white">Управление ДЗ</Text>
                <Text fontSize="sm" color="gray.400">Создание и назначение заданий</Text>
              </VStack>
            </HStack>
          </Card>
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
