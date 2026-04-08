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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Container,
  Flex,
  Avatar,
} from "@chakra-ui/react";
import {
  FiCode,
  FiBook,
  FiCheckSquare,
  FiList,
  FiLogOut,
  FiPlay,
  FiCpu,
  FiServer,
  FiZap,
  FiStar,
  FiTrendingUp,
  FiMessageSquare,
  FiUsers,
  FiAward,
  FiBell,
  FiUser,
  FiLayers,
  FiBarChart2,
  FiFileText,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { PYTHON_TOPICS } from "../data/pythonTopics";

interface DashboardProps {
  onNavigate: (section: string) => void;
  onStartInterview: (roomId: string) => void;
  onNavigateToHomework: () => void;
  onNavigateToPostgres: () => void;
  onNavigateToPandas: () => void;
  onNavigateToAirflow: () => void;
  onNavigateToSpark: () => void;
  onViewUserProfile: (userId: string) => void;
  onNavigateToAchievements: () => void;
  onNavigateToStats: () => void;
  onNavigateToTemplates: () => void;
}

export default function Dashboard({
  onNavigate,
  onStartInterview,
  onNavigateToHomework,
  onNavigateToPostgres,
  onNavigateToPandas,
  onNavigateToAirflow,
  onNavigateToSpark,
  onViewUserProfile,
  onNavigateToAchievements,
  onNavigateToStats,
  onNavigateToTemplates,
}: DashboardProps) {
  const { userData, logout } = useAuth();
  const [roomIdInput, setRoomIdInput] = useState("");
  const toast = useToast();

  const handleNavigateToLiveCoding = () => {
    const roomId = roomIdInput.trim() || Math.random().toString(36).substring(2, 6).toUpperCase();
    if (!roomId) {
      toast({ status: "error", title: "Ошибка создания комнаты" });
      return;
    }
    onStartInterview(roomId);
  };

  const stats = [
    { label: "Тем по Python", value: 8, color: "green", icon: FiBook },
    { label: "Задач в банке", value: 11, color: "purple", icon: FiList },
    { label: "Уровней", value: 8, color: "blue", icon: FiTrendingUp },
  ];

  const theoryTopics = [
    {
      title: "Учебные материалы по Python",
      description: "8 тем от основ до продвинутых: типы данных, функции, ООП, декораторы, метаклассы, дескрипторы, логирование",
      icon: FiBook,
      color: "green",
      onClick: () => onNavigate("topics"),
      badge: `${PYTHON_TOPICS.length} тем`,
    },
    {
      title: "Pandas & NumPy",
      description: "Анализ данных, массивы, операции с данными",
      icon: FiCpu,
      color: "orange",
      onClick: onNavigateToPandas,
      badge: "Data Science",
    },
    {
      title: "Apache Airflow",
      description: "Оркестрация и автоматизация пайплайнов",
      icon: FiServer,
      color: "teal",
      onClick: onNavigateToAirflow,
      badge: "ETL",
    },
    {
      title: "Apache Spark",
      description: "Распределённая обработка больших данных",
      icon: FiZap,
      color: "red",
      onClick: onNavigateToSpark,
      badge: "Big Data",
    },
  ];

  const practiceTopics = [
    {
      title: "Live Coding",
      description: "Совместное написание кода в реальном времени с общими курсорами",
      icon: FiCode,
      color: "blue",
      onClick: handleNavigateToLiveCoding,
      badge: "Real-time",
    },
    {
      title: "Индивидуальные задачи",
      description: "Домашние задания, назначенные администратором, с автоматической проверкой",
      icon: FiCheckSquare,
      color: "orange",
      onClick: onNavigateToHomework,
      badge: "Homework",
    },
    {
      title: "Банк задач",
      description: "Коллекция задач для практики с таймером: лёгкие, средние и сложные",
      icon: FiList,
      color: "purple",
      onClick: () => onNavigate("problems"),
      badge: "11 задач",
    },
    {
      title: "Песочница",
      description: "Свободное написание и выполнение Python кода с Pyodide",
      icon: FiPlay,
      color: "green",
      onClick: () => onNavigate("sandbox"),
      badge: "Free Code",
    },
    {
      title: "PostgreSQL",
      description: "Задачи по SQL: SELECT, JOIN, GROUP BY, оконные функции",
      icon: FiServer,
      color: "blue",
      onClick: onNavigateToPostgres,
      badge: "SQL",
    },
    {
      title: "Code Golf",
      description: "Решайте задачи минимальным количеством символов",
      icon: FiStar,
      color: "yellow",
      onClick: () => onNavigate("code-golf"),
      badge: "Challenge",
    },
  ];

  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500">
      {/* Header */}
      <Box
        bg="rgba(255,255,255,0.03)"
        borderBottom="1px solid rgba(255,255,255,0.1)"
        px={6}
        py={4}
      >
        <Container maxW="1200px">
          <Flex justify="space-between" align="center">
            <HStack spacing={4}>
              <Avatar
                size="sm"
                name={userData?.displayName}
                src={userData?.avatarUrl}
                bg={userData?.nicknameColor || userData?.color || "purple.600"}
                color="white"
                cursor="pointer"
                onClick={() => onViewUserProfile(userData?.uid || "")}
                _hover={{ transform: "scale(1.1)", transition: "transform 0.2s" }}
              />
              <VStack align="start" spacing={0}>
                <HStack spacing={2}>
                  <Text
                    color={userData?.nicknameColor || "white"}
                    fontWeight="bold"
                    fontSize="lg"
                  >
                    {userData?.displayName || "User"}
                  </Text>
                  {userData?.customTag && (
                    <Badge colorScheme="purple" fontSize="xs">
                      {userData.customTag}
                    </Badge>
                  )}
                </HStack>
                {userData?.tags && userData.tags.length > 0 && (
                  <HStack spacing={1} mt={1}>
                    {userData.tags.slice(0, 3).map((tag: string, idx: number) => (
                      <Badge key={idx} colorScheme="purple" fontSize="xs" px={2} py={0.5} borderRadius="full">
                        {tag}
                      </Badge>
                    ))}
                    {userData.tags.length > 3 && (
                      <Text fontSize="xs" color="gray.500">+{userData.tags.length - 3}</Text>
                    )}
                  </HStack>
                )}
              </VStack>
            </HStack>
            <HStack spacing={4}>
              <Badge
                colorScheme={userData?.role === "admin" ? "purple" : "blue"}
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
              >
                {userData?.role === "admin" ? "Admin" : "User"}
              </Badge>
              <Button
                leftIcon={<Icon as={FiUser} />}
                onClick={() => onViewUserProfile(userData?.uid || "")}
                bg="rgba(255,255,255, 0.1)"
                color="white"
                _hover={{ bg: "rgba(255,255,255, 0.2)" }}
                size="sm"
              >
                Профиль
              </Button>
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
          </Flex>
        </Container>
      </Box>

      <Container maxW="1200px" py={8} px={6}>
        <VStack spacing={8} align="stretch">
          {/* Quick Start */}
          <Card
            bg="linear-gradient(135deg, rgba(128,0,255,0.15) 0%, rgba(0,128,255,0.15) 100%)"
            borderRadius="2xl"
            p={6}
            border="1px solid rgba(128,0,255,0.3)"
          >
            <CardBody p={0}>
              <Heading fontSize="xl" color="white" mb={4}>
                🚀 Быстрый старт интервью
              </Heading>
              <HStack spacing={4}>
                <Box flex={1}>
                  <input
                    type="text"
                    placeholder="Введите ID комнаты или оставьте пустым для создания новой"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.08)",
                      color: "white",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />
                </Box>
                <Button
                  bg="purple.600"
                  color="white"
                  _hover={{ bg: "purple.700" }}
                  onClick={handleNavigateToLiveCoding}
                  size="lg"
                  px={8}
                >
                  Начать
                </Button>
              </HStack>
            </CardBody>
          </Card>

          {/* Stats */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {stats.map((stat, idx) => (
              <Card
                key={idx}
                bg="rgba(255, 255, 255, 0.05)"
                borderRadius="xl"
                p={5}
                textAlign="center"
                border="1px solid rgba(255,255,255,0.1)"
              >
                <Icon as={stat.icon} w={8} h={8} color={`${stat.color}.400`} mb={2} />
                <Text fontSize="3xl" fontWeight="bold" color={`${stat.color}.400`}>
                  {stat.value}
                </Text>
                <Text color="gray.400" fontSize="sm">{stat.label}</Text>
              </Card>
            ))}
          </SimpleGrid>

          {/* Tabs: Theory / Practice / Communication */}
          <Tabs variant="soft-rounded" colorScheme="purple" size="lg">
            <TabList justifyContent="center" mb={6}>
              <Tab
                _selected={{ bg: "purple.600", color: "white" }}
                px={8}
                py={3}
                borderRadius="full"
                fontSize="md"
                fontWeight="bold"
              >
                <Icon as={FiBook} mr={2} />
                Теория
              </Tab>
              <Tab
                _selected={{ bg: "purple.600", color: "white" }}
                px={8}
                py={3}
                borderRadius="full"
                fontSize="md"
                fontWeight="bold"
              >
                <Icon as={FiCode} mr={2} />
                Практика
              </Tab>
              <Tab
                _selected={{ bg: "purple.600", color: "white" }}
                px={8}
                py={3}
                borderRadius="full"
                fontSize="md"
                fontWeight="bold"
              >
                <Icon as={FiUsers} mr={2} />
                Коммуникация
              </Tab>
            </TabList>

            <TabPanels>
              {/* Theory Tab */}
              <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {theoryTopics.map((topic, idx) => (
                  <Card
                    key={idx}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderRadius="xl"
                    p={5}
                    cursor="pointer"
                    _hover={{
                      bg: "rgba(255, 255, 255, 0.1)",
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    }}
                    transition="all 0.2s"
                    onClick={topic.onClick}
                    border="1px solid rgba(255,255,255,0.1)"
                  >
                    <CardBody p={0}>
                      <HStack spacing={4} mb={3}>
                        <Box
                          w={12}
                          h={12}
                          borderRadius="xl"
                          bg={`${topic.color}.600`}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon as={topic.icon} w={6} h={6} color="white" />
                        </Box>
                        <VStack align="start" spacing={0} flex={1}>
                          <HStack justify="space-between" w="100%">
                            <Text fontSize="lg" fontWeight="bold" color="white">
                              {topic.title}
                            </Text>
                            <Badge colorScheme={topic.color} fontSize="xs" px={2} py={1} borderRadius="full">
                              {topic.badge}
                            </Badge>
                          </HStack>
                        </VStack>
                      </HStack>
                      <Divider borderColor="rgba(255,255,255,0.1)" my={3} />
                      <Text color="gray.400" fontSize="sm">
                        {topic.description}
                      </Text>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </TabPanel>

            {/* Practice Tab */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {practiceTopics.map((topic, idx) => (
                  <Card
                    key={idx}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderRadius="xl"
                    p={5}
                    cursor="pointer"
                    _hover={{
                      bg: "rgba(255, 255, 255, 0.1)",
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    }}
                    transition="all 0.2s"
                    onClick={topic.onClick}
                    border="1px solid rgba(255,255,255,0.1)"
                  >
                    <CardBody p={0}>
                      <HStack spacing={4} mb={3}>
                        <Box
                          w={12}
                          h={12}
                          borderRadius="xl"
                          bg={`${topic.color}.600`}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon as={topic.icon} w={6} h={6} color="white" />
                        </Box>
                        <VStack align="start" spacing={0} flex={1}>
                          <HStack justify="space-between" w="100%">
                            <Text fontSize="lg" fontWeight="bold" color="white">
                              {topic.title}
                            </Text>
                            <Badge colorScheme={topic.color} fontSize="xs" px={2} py={1} borderRadius="full">
                              {topic.badge}
                            </Badge>
                          </HStack>
                        </VStack>
                      </HStack>
                      <Divider borderColor="rgba(255,255,255,0.1)" my={3} />
                      <Text color="gray.400" fontSize="sm">
                        {topic.description}
                      </Text>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </TabPanel>

            {/* Communication Tab */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {/* Friends */}
                <Card
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius="xl"
                  p={5}
                  cursor="pointer"
                  _hover={{
                    bg: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                  transition="all 0.2s"
                  onClick={() => onNavigate("friends")}
                  border="1px solid rgba(255,255,255,0.1)"
                >
                  <CardBody p={0}>
                    <HStack spacing={4} mb={3}>
                      <Box
                        w={12}
                        h={12}
                        borderRadius="xl"
                        bg="blue.600"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiUsers} w={6} h={6} color="white" />
                      </Box>
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="lg" fontWeight="bold" color="white">
                          Друзья
                        </Text>
                      </VStack>
                    </HStack>
                    <Divider borderColor="rgba(255,255,255,0.1)" my={3} />
                    <Text color="gray.400" fontSize="sm">
                      Список друзей, запросы на дружбу, профили пользователей
                    </Text>
                  </CardBody>
                </Card>

                {/* Messages */}
                <Card
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius="xl"
                  p={5}
                  cursor="pointer"
                  _hover={{
                    bg: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                  transition="all 0.2s"
                  onClick={() => onNavigate("chat")}
                  border="1px solid rgba(255,255,255,0.1)"
                >
                  <CardBody p={0}>
                    <HStack spacing={4} mb={3}>
                      <Box
                        w={12}
                        h={12}
                        borderRadius="xl"
                        bg="green.600"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiMessageSquare} w={6} h={6} color="white" />
                      </Box>
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="lg" fontWeight="bold" color="white">
                          Сообщения
                        </Text>
                      </VStack>
                    </HStack>
                    <Divider borderColor="rgba(255,255,255,0.1)" my={3} />
                    <Text color="gray.400" fontSize="sm">
                      Чат с друзьями, групповые чаты, история сообщений
                    </Text>
                  </CardBody>
                </Card>

                {/* Notifications */}
                <Card
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius="xl"
                  p={5}
                  cursor="pointer"
                  _hover={{
                    bg: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                  transition="all 0.2s"
                  onClick={() => onNavigate("notifications")}
                  border="1px solid rgba(255,255,255,0.1)"
                >
                  <CardBody p={0}>
                    <HStack spacing={4} mb={3}>
                      <Box
                        w={12}
                        h={12}
                        borderRadius="xl"
                        bg="yellow.600"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiBell} w={6} h={6} color="white" />
                      </Box>
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="lg" fontWeight="bold" color="white">
                          Уведомления
                        </Text>
                      </VStack>
                    </HStack>
                    <Divider borderColor="rgba(255,255,255,0.1)" my={3} />
                    <Text color="gray.400" fontSize="sm">
                      Новые сообщения, достижения, системные уведомления
                    </Text>
                  </CardBody>
                </Card>

                {/* Leaderboard */}
                <Card
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius="xl"
                  p={5}
                  cursor="pointer"
                  _hover={{
                    bg: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                  transition="all 0.2s"
                  onClick={() => onNavigate("leaderboard")}
                  border="1px solid rgba(255,255,255,0.1)"
                >
                  <CardBody p={0}>
                    <HStack spacing={4} mb={3}>
                      <Box
                        w={12}
                        h={12}
                        borderRadius="xl"
                        bg="purple.600"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiAward} w={6} h={6} color="white" />
                      </Box>
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="lg" fontWeight="bold" color="white">
                          Таблица лидеров
                        </Text>
                      </VStack>
                    </HStack>
                    <Divider borderColor="rgba(255,255,255,0.1)" my={3} />
                    <Text color="gray.400" fontSize="sm">
                      Рейтинг пользователей, достижения, статистика
                    </Text>
                  </CardBody>
                </Card>

                {/* My Profile */}
                <Card
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius="xl"
                  p={5}
                  cursor="pointer"
                  _hover={{
                    bg: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                  transition="all 0.2s"
                  onClick={() => onViewUserProfile(userData?.uid || "")}
                  border="1px solid rgba(255,255,255,0.1)"
                >
                  <CardBody p={0}>
                    <HStack spacing={4} mb={3}>
                      <Box
                        w={12}
                        h={12}
                        borderRadius="xl"
                        bg="pink.600"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiUser} w={6} h={6} color="white" />
                      </Box>
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="lg" fontWeight="bold" color="white">
                          Мой профиль
                        </Text>
                      </VStack>
                    </HStack>
                    <Divider borderColor="rgba(255,255,255,0.1)" my={3} />
                    <Text color="gray.400" fontSize="sm">
                      Информация о профиле, статистика, настройки
                    </Text>
                  </CardBody>
                </Card>

                {/* Snippet Library */}
                <Card
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius="xl"
                  p={5}
                  cursor="pointer"
                  _hover={{
                    bg: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                  transition="all 0.2s"
                  onClick={() => onNavigate("snippets")}
                  border="1px solid rgba(255,255,255,0.1)"
                >
                  <CardBody p={0}>
                    <HStack spacing={4} mb={3}>
                      <Box
                        w={12}
                        h={12}
                        borderRadius="xl"
                        bg="teal.600"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiLayers} w={6} h={6} color="white" />
                      </Box>
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="lg" fontWeight="bold" color="white">
                          Библиотека сниппетов
                        </Text>
                      </VStack>
                    </HStack>
                    <Divider borderColor="rgba(255,255,255,0.1)" my={3} />
                    <Text color="gray.400" fontSize="sm">
                      Сохранённые фрагменты кода, шаблоны, примеры
                    </Text>
                  </CardBody>
                </Card>

                {/* Achievements */}
                <Card
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius="xl"
                  p={5}
                  cursor="pointer"
                  _hover={{
                    bg: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                  transition="all 0.2s"
                  onClick={onNavigateToAchievements}
                  border="1px solid rgba(255,255,255,0.1)"
                >
                  <CardBody p={0}>
                    <HStack spacing={4} mb={3}>
                      <Box
                        w={12}
                        h={12}
                        borderRadius="xl"
                        bg="yellow.600"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiAward} w={6} h={6} color="white" />
                      </Box>
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="lg" fontWeight="bold" color="white">
                          Достижения
                        </Text>
                      </VStack>
                    </HStack>
                    <Divider borderColor="rgba(255,255,255,0.1)" my={3} />
                    <Text color="gray.400" fontSize="sm">
                      Награды за выполнение задач, серии дней, специальные достижения
                    </Text>
                  </CardBody>
                </Card>

                {/* Statistics */}
                <Card
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius="xl"
                  p={5}
                  cursor="pointer"
                  _hover={{
                    bg: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                  transition="all 0.2s"
                  onClick={onNavigateToStats}
                  border="1px solid rgba(255,255,255,0.1)"
                >
                  <CardBody p={0}>
                    <HStack spacing={4} mb={3}>
                      <Box
                        w={12}
                        h={12}
                        borderRadius="xl"
                        bg="blue.600"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiBarChart2} w={6} h={6} color="white" />
                      </Box>
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="lg" fontWeight="bold" color="white">
                          Статистика
                        </Text>
                      </VStack>
                    </HStack>
                    <Divider borderColor="rgba(255,255,255,0.1)" my={3} />
                    <Text color="gray.400" fontSize="sm">
                      Графики прогресса, детальная аналитика, время обучения
                    </Text>
                  </CardBody>
                </Card>

                {/* Code Templates */}
                <Card
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius="xl"
                  p={5}
                  cursor="pointer"
                  _hover={{
                    bg: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                  transition="all 0.2s"
                  onClick={onNavigateToTemplates}
                  border="1px solid rgba(255,255,255,0.1)"
                >
                  <CardBody p={0}>
                    <HStack spacing={4} mb={3}>
                      <Box
                        w={12}
                        h={12}
                        borderRadius="xl"
                        bg="green.600"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiFileText} w={6} h={6} color="white" />
                      </Box>
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="lg" fontWeight="bold" color="white">
                          Шаблоны кода
                        </Text>
                      </VStack>
                    </HStack>
                    <Divider borderColor="rgba(255,255,255,0.1)" my={3} />
                    <Text color="gray.400" fontSize="sm">
                      Готовые шаблоны для алгоритмов, структур данных, ООП
                    </Text>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </Box>
  );
}
