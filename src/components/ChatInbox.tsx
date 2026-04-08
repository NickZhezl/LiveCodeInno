import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  useToast,
  Icon,
  Avatar,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { FiSearch, FiMessageSquare, FiArrowLeft, FiHash } from "react-icons/fi";
import { firestore } from "../main";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import Chat from "./Chat";

interface ChatInboxProps {
  onBack: () => void;
  onViewProfile: (userId: string) => void;
}

interface Conversation {
  roomId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  otherUserRole: "user" | "admin";
  otherUserNicknameColor?: string;
  otherUserCustomTag?: string;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
}

export default function ChatInbox({ onBack, onViewProfile }: ChatInboxProps) {
  const { userData } = useAuth();
  const toast = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!userData) return;
    loadConversations();
  }, [userData]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredConversations(
        conversations.filter((c) =>
          c.otherUserName.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const loadConversations = async () => {
    if (!userData) return;
    setIsLoading(true);

    try {
      const chatRoomsRef = collection(firestore, "chatRooms");
      const q = query(chatRoomsRef);

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const convos: Conversation[] = [];

        for (const roomDoc of snapshot.docs) {
          const roomData = roomDoc.data();

          // Check if user is a participant
          if (!roomData.participants?.includes(userData.uid)) continue;

          // Find the other user
          const otherUserId = roomData.participants.find(
            (id: string) => id !== userData.uid
          );

          if (!otherUserId) continue;

          // Get other user's info
          const userRef = doc(firestore, "users", otherUserId);
          const userSnap = await getDoc(userRef);
          const userData2 = userSnap.exists() ? userSnap.data() : {};

          // Count unread messages
          const messagesRef = collection(
            firestore,
            `chatRooms/${roomDoc.id}/messages`
          );
          const msgQuery = query(
            messagesRef,
            where("read", "==", false),
            where("senderId", "==", otherUserId)
          );
          const msgSnap = await getDocs(msgQuery);

          convos.push({
            roomId: roomDoc.id,
            otherUserId,
            otherUserName: userData2.displayName || "Unknown User",
            otherUserAvatar: userData2.avatarUrl,
            otherUserRole: userData2.role || "user",
            otherUserNicknameColor: userData2.nicknameColor || "#ffffff",
            otherUserCustomTag: userData2.customTag || "",
            lastMessage: roomData.lastMessage || "No messages yet",
            lastMessageTime: roomData.lastMessageTime,
            unreadCount: msgSnap.size,
          });
        }

        // Sort by last message time
        convos.sort((a, b) => {
          const timeA = a.lastMessageTime?.toMillis?.() || 0;
          const timeB = b.lastMessageTime?.toMillis?.() || 0;
          return timeB - timeA;
        });

        setConversations(convos);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast({ title: "Ошибка загрузки чатов", status: "error" });
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) {
      return date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Вчера";
    } else if (days < 7) {
      return `${days} дн назад`;
    } else {
      return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      });
    }
  };

  if (selectedConversation) {
    return (
      <Box>
        <Button
          mb={4}
          bg="rgba(255,255,255,0.1)"
          color="white"
          _hover={{ bg: "rgba(255,255,255,0.2)" }}
          leftIcon={<Icon as={FiArrowLeft} />}
          onClick={() => setSelectedConversation(null)}
        >
          Назад к чатам
        </Button>
        <Chat
          chatWith={selectedConversation}
          onClose={() => setSelectedConversation(null)}
          onViewProfile={onViewProfile}
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <HStack justify="space-between" mb={6}>
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
            💬 Сообщения
          </Heading>
        </HStack>
        {conversations.some((c) => c.unreadCount > 0) && (
          <Badge colorScheme="red" fontSize="md" px={3} py={1}>
            {conversations.reduce((sum, c) => sum + c.unreadCount, 0)} новых
          </Badge>
        )}
      </HStack>

      {/* Search */}
      <InputGroup mb={4}>
        <InputLeftElement pointerEvents="none">
          <Icon as={FiSearch} color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Поиск по имени..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          bg="rgba(255,255,255,0.05)"
          color="white"
          borderColor="gray.600"
          _focus={{ borderColor: "purple.500" }}
          pl={10}
        />
      </InputGroup>

      {/* Conversations List */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={20}>
          <Spinner size="xl" color="purple.500" />
        </Box>
      ) : filteredConversations.length > 0 ? (
        <VStack spacing={3} align="stretch">
          {filteredConversations.map((convo) => (
            <Card
              key={convo.roomId}
              bg={
                convo.unreadCount > 0
                  ? "rgba(128,0,255,0.1)"
                  : "rgba(255,255,255,0.05)"
              }
              borderRadius="xl"
              cursor="pointer"
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
              onClick={() =>
                setSelectedConversation({
                  uid: convo.otherUserId,
                  displayName: convo.otherUserName,
                  email: "",
                  role: convo.otherUserRole,
                  avatarUrl: convo.otherUserAvatar,
                  nicknameColor: convo.otherUserNicknameColor,
                  customTag: convo.otherUserCustomTag,
                })
              }
            >
              <CardBody>
                <HStack spacing={4} align="flex-start">
                  <Box position="relative">
                    <Avatar
                      size="md"
                      name={convo.otherUserName}
                      src={convo.otherUserAvatar || undefined}
                      bg="purple.600"
                      cursor="pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewProfile(convo.otherUserId);
                      }}
                    />
                    {convo.unreadCount > 0 && (
                      <Badge
                        position="absolute"
                        top={-2}
                        right={-2}
                        colorScheme="red"
                        borderRadius="full"
                        fontSize="xs"
                        px={2}
                        py={1}
                      >
                        {convo.unreadCount}
                      </Badge>
                    )}
                  </Box>
                  <VStack align="start" flex={1} spacing={1}>
                    <HStack justify="space-between" w="full">
                      <HStack spacing={2}>
                        <Text
                          fontWeight="bold"
                          color={convo.otherUserNicknameColor || "white"}
                          fontSize="lg"
                          cursor="pointer"
                          _hover={{ textDecoration: "underline" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewProfile(convo.otherUserId);
                          }}
                        >
                          {convo.otherUserName}
                        </Text>
                        {convo.otherUserCustomTag && (
                          <Badge
                            colorScheme="purple"
                            fontSize="xs"
                            px={2}
                            py={1}
                            borderRadius="full"
                          >
                            <Icon as={FiHash} w={2} h={2} />
                            {convo.otherUserCustomTag}
                          </Badge>
                        )}
                        <Badge
                          colorScheme={
                            convo.otherUserRole === "admin"
                              ? "purple"
                              : "blue"
                          }
                          fontSize="xs"
                        >
                          {convo.otherUserRole === "admin"
                            ? "Админ"
                            : "Пользователь"}
                        </Badge>
                      </HStack>
                      <Text color="gray.500" fontSize="xs">
                        {formatTime(convo.lastMessageTime)}
                      </Text>
                    </HStack>
                    <Text
                      color={
                        convo.unreadCount > 0 ? "gray.300" : "gray.500"
                      }
                      fontSize="sm"
                      noOfLines={2}
                      fontWeight={
                        convo.unreadCount > 0 ? "bold" : "normal"
                      }
                    >
                      {convo.lastMessage || "Нет сообщений"}
                    </Text>
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
          <Icon as={FiMessageSquare} w={16} h={16} color="gray.600" mb={4} />
          <Text color="gray.400" fontSize="lg">
            {searchQuery ? "Чаты не найдены" : "Нет сообщений"}
          </Text>
          <Text color="gray.500" fontSize="sm" mt={2}>
            {searchQuery
              ? "Попробуйте изменить запрос"
              : "Найдите пользователя, чтобы начать общение"}
          </Text>
        </Box>
      )}
    </Box>
  );
}
