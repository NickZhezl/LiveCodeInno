import { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  useToast,
  Icon,
  Avatar,
  Badge,
  Flex,
  Spinner,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import {
  FiSend,
  FiX,
  FiTrash2,
  FiMessageSquare,
  FiHash,
} from "react-icons/fi";
import { firestore } from "../main";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
  read: boolean;
}

interface ChatUser {
  uid: string;
  displayName: string;
  email: string;
  role: "user" | "admin";
  avatarUrl?: string;
  nicknameColor?: string;
  customTag?: string;
}

interface ChatProps {
  chatWith: ChatUser;
  onClose: () => void;
  onViewProfile?: (userId: string) => void;
}

export default function Chat({ chatWith, onClose, onViewProfile }: ChatProps) {
  const { userData: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Generate or find chat room ID
  useEffect(() => {
    if (!currentUser || !chatWith) return;
    findOrCreateChatRoom();
  }, [currentUser, chatWith]);

  // Load messages
  useEffect(() => {
    if (!chatRoomId) return;

    const messagesRef = collection(
      firestore,
      `chatRooms/${chatRoomId}/messages`
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
      setIsLoading(false);

      // Mark messages as read
      markMessagesAsRead(msgs);
    });

    return () => unsubscribe();
  }, [chatRoomId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const findOrCreateChatRoom = async () => {
    if (!currentUser) return;

    try {
      // Generate consistent chat room ID (sorted UIDs)
      const uids = [currentUser.uid, chatWith.uid].sort();
      const roomId = `chat_${uids[0]}_${uids[1]}`;

      // Check if room exists
      const roomRef = doc(firestore, "chatRooms", roomId);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        // Create new chat room
        await setDoc(roomRef, {
          participants: [currentUser.uid, chatWith.uid],
          participantNames: {
            [currentUser.uid]: currentUser.displayName,
            [chatWith.uid]: chatWith.displayName,
          },
          createdAt: serverTimestamp(),
          lastMessage: "",
          lastMessageTime: serverTimestamp(),
        });
      }

      setChatRoomId(roomId);
    } catch (error: any) {
      console.error("Error finding/creating chat room:", error);
      if (error.code === "permission-denied") {
        toast({ 
          title: "Нет доступа к чату", 
          description: "Деплой правил Firestore не выполнен. Обратитесь к администратору.",
          status: "error",
          duration: 5000 
        });
      } else {
        toast({ title: "Ошибка создания чата", status: "error" });
      }
    }
  };

  const markMessagesAsRead = async (msgs: Message[]) => {
    if (!currentUser || !chatRoomId) return;

    const unreadMessages = msgs.filter(
      (m) => m.senderId !== currentUser.uid && !m.read
    );

    if (unreadMessages.length === 0) return;

    // Mark as read in batch
    const batch = unreadMessages.map(async (msg) => {
      const msgRef = doc(
        firestore,
        `chatRooms/${chatRoomId}/messages/${msg.id}`
      );
      await updateDoc(msgRef, { read: true });
    });

    await Promise.all(batch);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatRoomId || !currentUser) return;

    setIsSending(true);
    try {
      const messagesRef = collection(
        firestore,
        `chatRooms/${chatRoomId}/messages`
      );

      await addDoc(messagesRef, {
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        read: false,
      });

      // Update last message in chat room
      const roomRef = doc(firestore, "chatRooms", chatRoomId);
      await updateDoc(roomRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Ошибка отправки сообщения", status: "error" });
    } finally {
      setIsSending(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!chatRoomId) return;

    try {
      const msgRef = doc(
        firestore,
        `chatRooms/${chatRoomId}/messages/${messageId}`
      );
      await deleteDoc(msgRef);
      toast({ title: "Сообщение удалено", status: "info" });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({ title: "Ошибка удаления", status: "error" });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date();
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Сегодня";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Вчера";
    } else {
      return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
      });
    }
  };

  return (
    <Box
      bg="rgba(255,255,255,0.03)"
      borderRadius="xl"
      border="1px solid rgba(255,255,255,0.1)"
      h="600px"
      display="flex"
      flexDirection="column"
    >
      {/* Chat Header */}
      <HStack
        p={4}
        borderBottom="1px solid rgba(255,255,255,0.1)"
        justify="space-between"
      >
        <HStack spacing={3}>
          <Avatar
            size="sm"
            name={chatWith.displayName}
            src={chatWith.avatarUrl || undefined}
            bg="purple.600"
            cursor="pointer"
            onClick={() => onViewProfile?.(chatWith.uid)}
          />
          <VStack align="start" spacing={0}>
            <HStack spacing={2}>
              <Text
                color={chatWith.nicknameColor || "white"}
                fontWeight="bold"
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
                onClick={() => onViewProfile?.(chatWith.uid)}
              >
                {chatWith.displayName}
              </Text>
              {chatWith.customTag && (
                <Badge
                  colorScheme="purple"
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  <Icon as={FiHash} w={2} h={2} />
                  {chatWith.customTag}
                </Badge>
              )}
              {onViewProfile && (
                <Tooltip label="Посмотреть профиль">
                  <Button
                    size="xs"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _hover={{ bg: "rgba(255,255,255,0.2)" }}
                    onClick={() => onViewProfile(chatWith.uid)}
                  >
                    Профиль
                  </Button>
                </Tooltip>
              )}
            </HStack>
            <Badge
              colorScheme={chatWith.role === "admin" ? "purple" : "blue"}
              fontSize="xs"
            >
              {chatWith.role === "admin" ? "Админ" : "Пользователь"}
            </Badge>
          </VStack>
        </HStack>
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

      {/* Messages */}
      <Box flex={1} overflowY="auto" p={4}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={20}>
            <Spinner size="xl" color="purple.500" />
          </Box>
        ) : messages.length > 0 ? (
          <VStack spacing={4} align="stretch">
            {messages.map((msg, idx) => {
              const isOwn = msg.senderId === currentUser?.uid;
              const showDate =
                idx === 0 ||
                formatDate(msg.timestamp) !== formatDate(messages[idx - 1]?.timestamp);

              return (
                <Box key={msg.id}>
                  {showDate && (
                    <Flex justify="center" mb={3}>
                      <Badge colorScheme="gray" fontSize="xs">
                        {formatDate(msg.timestamp)}
                      </Badge>
                    </Flex>
                  )}
                  <Flex
                    justify={isOwn ? "flex-end" : "flex-start"}
                    mb={2}
                  >
                    <HStack
                      align="flex-end"
                      spacing={2}
                      maxW="70%"
                    >
                      {!isOwn && (
                        <Avatar
                          size="xs"
                          name={msg.senderName}
                          bg="purple.600"
                        />
                      )}
                      <Box position="relative">
                        <Box
                          bg={isOwn ? "purple.600" : "rgba(255,255,255,0.1)"}
                          color="white"
                          px={4}
                          py={2}
                          borderRadius="lg"
                          borderTopRightRadius={isOwn ? "sm" : "lg"}
                          borderTopLeftRadius={isOwn ? "lg" : "sm"}
                        >
                          <Text fontSize="sm" whiteSpace="pre-wrap">
                            {msg.text}
                          </Text>
                        </Box>
                        <HStack
                          spacing={1}
                          mt={1}
                          justify={isOwn ? "flex-end" : "flex-start"}
                        >
                          <Text color="gray.500" fontSize="xs">
                            {formatTime(msg.timestamp)}
                          </Text>
                          {isOwn && (
                            <Text fontSize="xs" color={msg.read ? "blue.400" : "gray.500"}>
                              {msg.read ? "✓✓" : "✓"}
                            </Text>
                          )}
                        </HStack>
                        {isOwn && (
                          <Tooltip label="Удалить">
                            <IconButton
                              aria-label="Delete message"
                              icon={<Icon as={FiTrash2} />}
                              size="xs"
                              position="absolute"
                              top={-2}
                              right={-8}
                              bg="transparent"
                              color="gray.600"
                              _hover={{ color: "red.400" }}
                              opacity={0}
                              _groupHover={{ opacity: 1 }}
                              onClick={() => deleteMessage(msg.id)}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </HStack>
                  </Flex>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </VStack>
        ) : (
          <Box
            h="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <Icon as={FiMessageSquare} w={16} h={16} color="gray.600" mb={4} />
            <Text color="gray.400">Нет сообщений</Text>
            <Text color="gray.500" fontSize="sm" mt={2}>
              Напишите первое сообщение!
            </Text>
          </Box>
        )}
      </Box>

      {/* Message Input */}
      <Box p={4} borderTop="1px solid rgba(255,255,255,0.1)">
        <HStack spacing={2}>
          <Input
            placeholder="Введите сообщение..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            bg="rgba(255,255,255,0.05)"
            color="white"
            borderColor="gray.600"
            _focus={{ borderColor: "purple.500" }}
            disabled={isSending}
          />
          <Button
            bg="purple.600"
            color="white"
            _hover={{ bg: "purple.700" }}
            onClick={sendMessage}
            isLoading={isSending}
            disabled={!newMessage.trim()}
            leftIcon={<Icon as={FiSend} />}
          >
            Отправить
          </Button>
        </HStack>
        <Text color="gray.500" fontSize="xs" mt={2}>
          Нажмите Enter для отправки
        </Text>
      </Box>
    </Box>
  );
}
