import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Icon,
  Divider,
  useToast,
} from "@chakra-ui/react";
import {
  FiCode,
  FiBook,
  FiCheckSquare,
  FiList,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

interface DashboardProps {
  onNavigate: (section: string) => void;
  onStartInterview: (roomId: string) => void;
}

export default function Dashboard({ onNavigate, onStartInterview }: DashboardProps) {
  const { userData, logout } = useAuth();
  const [roomIdInput, setRoomIdInput] = useState("");
  const toast = useToast();

  const handleNavigateToLiveCoding = () => {
    // Generate a room ID if none exists
    const roomId = roomIdInput.trim() || Math.random().toString(36).substring(2, 6).toUpperCase();
    if (!roomId) {
      toast({ status: "error", title: "Ошибка создания комнаты" });
      return;
    }
    onStartInterview(roomId);
  };

  const handleNavigateToMyHomework = () => {
    onNavigate("my-homework");
  };

  const stats = [
    { label: "Тем по Python", value: 8, color: "green" },
    { label: "Задач в банке", value: 11, color: "purple" },
    { label: "Уровней", value: 8, color: "blue" },
  ];

  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500" p={8}>
      <VStack spacing={8} maxW="1200px" mx="auto" align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading fontSize="3xl" color="white">
              Live Code Interviewer
            </Heading>
            <Text color="gray.400">
              Добро пожаловать, {userData?.displayName || "User"}!
            </Text>
          </VStack>
          <HStack spacing={4}>
            <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="full">
              {userData?.role === "admin" ? "Admin" : "User"}
            </Badge>
            <Button
              leftIcon={<Icon as={FiLogOut} />}
              onClick={logout}
              bg="rgba(255,255,255, 0.1)"
              color="white"
              _hover={{ bg: "rgba(255,255,255, 0.2)" }}
              size="sm"
            >
              Выйти
            </Button>
          </HStack>
        </HStack>

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {stats.map((stat, idx) => (
            <Card
              key={idx}
              bg="rgba(255, 255, 255, 0.05)"
              borderRadius="xl"
              p={6}
              textAlign="center"
            >
              <Text fontSize="4xl" fontWeight="bold" color={`${stat.color}.400`}>
                {stat.value}
              </Text>
              <Text color="gray.400">{stat.label}</Text>
            </Card>
          ))}
        </SimpleGrid>

        {/* Quick Actions - Join Room */}
        <Card bg="rgba(255, 255, 255, 0.05)" borderRadius="xl" p={6}>
          <Heading fontSize="xl" color="white" mb={4}>
            Быстрый старт интервью
          </Heading>
          <HStack spacing={4}>
            <Box flex={1}>
              <input
                type="text"
                placeholder="Введите ID комнаты или создайте новый"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "white",
                  outline: "none",
                }}
              />
            </Box>
            <Button
              bg="purple.600"
              color="white"
              _hover={{ bg: "purple.700" }}
              onClick={handleNavigateToLiveCoding}
            >
              Начать интервью
            </Button>
          </HStack>
        </Card>

        {/* Main Sections - Practice */}
        <Heading fontSize="2xl" color="white" mt={8} mb={4}>
          🛠️ Практика
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Live Coding */}
          <Card
            bg="rgba(255, 255, 255, 0.05)"
            borderRadius="xl"
            p={6}
            cursor="pointer"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)", transform: "translateY(-4px)" }}
            transition="all 0.2s"
            onClick={handleNavigateToLiveCoding}
          >
            <CardBody>
              <HStack spacing={4} mb={4}>
                <Box
                  w={12}
                  h={12}
                  borderRadius="xl"
                  bg="blue.600"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiCode} w={6} h={6} color="white" />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="bold" color="white">
                    Live Coding
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    Интервью в реальном времени
                  </Text>
                </VStack>
              </HStack>
              <Divider borderColor="rgba(255,255,255,0.1)" my={4} />
              <Text color="gray.400" fontSize="sm">
                Совместное написание кода с кандидатом. Поддержка нескольких языков,
                синхронизация в реальном времени, общие курсоры.
              </Text>
              <Button
                mt={4}
                w="full"
                bg="blue.600"
                color="white"
                _hover={{ bg: "blue.700" }}
              >
                Начать сессию
              </Button>
            </CardBody>
          </Card>

          {/* Индивидуальные задачи */}
          <Card
            bg="rgba(255, 255, 255, 0.05)"
            borderRadius="xl"
            p={6}
            cursor="pointer"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)", transform: "translateY(-4px)" }}
            transition="all 0.2s"
            onClick={handleNavigateToMyHomework}
          >
            <CardBody>
              <HStack spacing={4} mb={4}>
                <Box
                  w={12}
                  h={12}
                  borderRadius="xl"
                  bg="orange.600"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiCheckSquare} w={6} h={6} color="white" />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="bold" color="white">
                    Индивидуальные задачи
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    Назначенные задания
                  </Text>
                </VStack>
              </HStack>
              <Divider borderColor="rgba(255,255,255,0.1)" my={4} />
              <Text color="gray.400" fontSize="sm">
                Домашние задания, назначенные администратором. Выполнение и автоматическая проверка.
              </Text>
              <Button
                mt={4}
                w="full"
                bg="orange.600"
                color="white"
                _hover={{ bg: "orange.700" }}
              >
                Смотреть задачи
              </Button>
            </CardBody>
          </Card>

          {/* Банк задач */}
          <Card
            bg="rgba(255, 255, 255, 0.05)"
            borderRadius="xl"
            p={6}
            cursor="pointer"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)", transform: "translateY(-4px)" }}
            transition="all 0.2s"
            onClick={() => onNavigate("problems")}
          >
            <CardBody>
              <HStack spacing={4} mb={4}>
                <Box
                  w={12}
                  h={12}
                  borderRadius="xl"
                  bg="purple.600"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiList} w={6} h={6} color="white" />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="bold" color="white">
                    Банк задач
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    Задачи с таймером
                  </Text>
                </VStack>
              </HStack>
              <Divider borderColor="rgba(255,255,255,0.1)" my={4} />
              <Text color="gray.400" fontSize="sm">
                Коллекция задач для практики. Легкие, средние и сложные задачи
                с ограничением по времени.
              </Text>
              <Button
                mt={4}
                w="full"
                bg="purple.600"
                color="white"
                _hover={{ bg: "purple.700" }}
              >
                Решать задачи
              </Button>
            </CardBody>
          </Card>

          {/* Python Sandbox */}
          <Card
            bg="rgba(255, 255, 255, 0.05)"
            borderRadius="xl"
            p={6}
            cursor="pointer"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)", transform: "translateY(-4px)" }}
            transition="all 0.2s"
            onClick={() => onNavigate("sandbox")}
          >
            <CardBody>
              <HStack spacing={4} mb={4}>
                <Box
                  w={12}
                  h={12}
                  borderRadius="xl"
                  bg="green.600"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiCode} w={6} h={6} color="white" />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="bold" color="white">
                    Песочница
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    Свободный кодинг
                  </Text>
                </VStack>
              </HStack>
              <Divider borderColor="rgba(255,255,255,0.1)" my={4} />
              <Text color="gray.400" fontSize="sm">
                Пишите и выполняйте любой Python код. Примеры кода, мгновенный результат.
              </Text>
              <Button
                mt={4}
                w="full"
                bg="green.600"
                color="white"
                _hover={{ bg: "green.700" }}
              >
                Открыть песочницу
              </Button>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Theory Section */}
        <Heading fontSize="2xl" color="white" mt={8} mb={4}>
          📚 Теория
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 1 }} spacing={6}>
          {/* Учебные материалы по Python */}
          <Card
            bg="rgba(255, 255, 255, 0.05)"
            borderRadius="xl"
            p={6}
            cursor="pointer"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)", transform: "translateY(-4px)" }}
            transition="all 0.2s"
            onClick={() => onNavigate("topics")}
          >
            <CardBody>
              <HStack spacing={4} mb={4}>
                <Box
                  w={12}
                  h={12}
                  borderRadius="xl"
                  bg="green.600"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiBook} w={6} h={6} color="white" />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="bold" color="white">
                    Учебные материалы по Python
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    Теория, подсказки, задания
                  </Text>
                </VStack>
              </HStack>
              <Divider borderColor="rgba(255,255,255,0.1)" my={4} />
              <Text color="gray.400" fontSize="sm">
                8 тем по Python от основ до продвинутых: типы данных, функции, ООП,
                декораторы, метаклассы, дескрипторы, логирование.
              </Text>
              <Button
                mt={4}
                w="full"
                bg="green.600"
                color="white"
                _hover={{ bg: "green.700" }}
              >
                Изучать темы
              </Button>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
