import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Heading,
  useToast,
  Icon,
  Avatar,
  Card,
  CardBody,
  Spinner,
  Badge,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { FiSearch, FiUser, FiMessageSquare, FiX } from "react-icons/fi";
import { firestore } from "../main";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

interface User {
  uid: string;
  displayName: string;
  email: string;
  role: "user" | "admin";
  avatarUrl?: string;
  bio?: string;
  createdAt: any;
}

interface UserSearchProps {
  onSelectUser: (user: User) => void;
  onClose: () => void;
}

export default function UserSearch({ onSelectUser, onClose }: UserSearchProps) {
  const { userData: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Load all users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"), limit(100));
      const usersSnap = await getDocs(q);
      const users = usersSnap.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as User[];

      // Filter out current user
      const filtered = currentUser
        ? users.filter((u) => u.uid !== currentUser.uid)
        : users;

      setAllUsers(filtered);
      setFilteredUsers(filtered);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({ title: "Ошибка загрузки пользователей", status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(allUsers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allUsers.filter(
      (user) =>
        user.displayName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.bio && user.bio.toLowerCase().includes(query))
    );
    setFilteredUsers(filtered);
  }, [searchQuery, allUsers]);

  return (
    <Box>
      {/* Header */}
      <HStack justify="space-between" mb={6}>
        <Heading fontSize="xl" color="white">
          Поиск пользователей
        </Heading>
        <Button
          size="sm"
          bg="rgba(255,255,255,0.1)"
          color="white"
          _hover={{ bg: "rgba(255,255,255,0.2)" }}
          onClick={onClose}
          leftIcon={<Icon as={FiX} />}
        >
          Закрыть
        </Button>
      </HStack>

      {/* Search Input */}
      <InputGroup mb={6}>
        <InputLeftElement pointerEvents="none">
          <Icon as={FiSearch} color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Поиск по имени, email или био..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          bg="rgba(255,255,255,0.05)"
          color="white"
          borderColor="gray.600"
          _focus={{ borderColor: "purple.500" }}
          pl={10}
        />
      </InputGroup>

      {/* Results Count */}
      {searchQuery && (
        <Text color="gray.400" mb={4} fontSize="sm">
          Найдено пользователей: {filteredUsers.length}
        </Text>
      )}

      {/* Users List */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={20}>
          <Spinner size="xl" color="purple.500" />
        </Box>
      ) : filteredUsers.length > 0 ? (
        <VStack spacing={4} align="stretch" maxH="600px" overflowY="auto">
          {filteredUsers.map((user) => (
            <Card
              key={user.uid}
              bg="rgba(255,255,255,0.05)"
              borderRadius="xl"
              _hover={{ bg: "rgba(255,255,255,0.08)" }}
              cursor="pointer"
              onClick={() => onSelectUser(user)}
            >
              <CardBody>
                <HStack spacing={4} align="flex-start">
                  <Avatar
                    size="md"
                    name={user.displayName}
                    src={user.avatarUrl || undefined}
                    bg="purple.600"
                  />
                  <VStack align="start" flex={1} spacing={1}>
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="bold" color="white" fontSize="lg">
                        {user.displayName}
                      </Text>
                      <Badge
                        colorScheme={user.role === "admin" ? "purple" : "blue"}
                        fontSize="xs"
                      >
                        {user.role === "admin" ? "Админ" : "Пользователь"}
                      </Badge>
                    </HStack>
                    <Text color="gray.400" fontSize="sm">
                      {user.email}
                    </Text>
                    {user.bio && (
                      <Text color="gray.500" fontSize="sm" noOfLines={2}>
                        {user.bio}
                      </Text>
                    )}
                    <HStack mt={2}>
                      <Icon as={FiMessageSquare} color="purple.400" />
                      <Text color="purple.400" fontSize="sm">
                        Нажми, чтобы открыть профиль и написать сообщение
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      ) : (
        <Box
          bg="rgba(255,255,255,0.05)"
          borderRadius="xl"
          p={10}
          textAlign="center"
        >
          <Icon as={FiUser} w={16} h={16} color="gray.600" mb={4} />
          <Text color="gray.400" fontSize="lg">
            {searchQuery ? "Пользователи не найдены" : "Нет пользователей"}
          </Text>
          <Text color="gray.500" fontSize="sm" mt={2}>
            {searchQuery
              ? "Попробуйте изменить запрос"
              : "Зарегистрируйте новых пользователей"}
          </Text>
        </Box>
      )}
    </Box>
  );
}
