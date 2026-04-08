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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { FiSearch, FiUserPlus, FiUserCheck, FiUserX, FiX } from "react-icons/fi";
import { firestore } from "../main";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import FriendChatModal from "./FriendChatModal";

interface FriendsProps {
  onViewProfile: (userId: string) => void;
  onBack?: () => void;
}

export default function Friends({ onViewProfile, onBack }: FriendsProps) {
  const { userData } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userData) return;
    loadFriends();
    loadFriendRequests();
  }, [userData]);

  const loadFriends = async () => {
    if (!userData) return;
    setIsLoading(true);

    try {
      const friendshipsRef = collection(firestore, "friendships");
      const q = query(
        friendshipsRef,
        where("userIds", "array-contains", userData.uid)
      );
      const snapshot = await getDocs(q);

      const friendsList: any[] = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const friendId = data.userIds.find((id: string) => id !== userData.uid);
        if (friendId) {
          const userRef = doc(firestore, "users", friendId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            friendsList.push({
              id: friendId,
              ...userSnap.data(),
              friendshipId: docSnap.id,
            });
          }
        }
      }
      setFriends(friendsList);
    } catch (error: any) {
      if (error.code === "permission-denied") {
        console.warn("Firestore rules not deployed yet. Friends list unavailable.");
        setFriends([]);
      } else {
        console.error("Error loading friends:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    if (!userData) return;

    try {
      // Incoming requests
      const incomingRef = collection(firestore, "friendRequests");
      const incomingQ = query(
        incomingRef,
        where("toUserId", "==", userData.uid),
        where("status", "==", "pending")
      );
      const incomingSnap = await getDocs(incomingQ);
      const incoming = incomingSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFriendRequests(incoming);

      // Sent requests
      const sentQ = query(
        incomingRef,
        where("fromUserId", "==", userData.uid),
        where("status", "==", "pending")
      );
      const sentSnap = await getDocs(sentQ);
      const sent = sentSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSentRequests(sent);
    } catch (error: any) {
      // Silently handle permission errors (rules not deployed yet)
      if (error.code === "permission-denied") {
        console.warn("Firestore rules not deployed yet. Friend requests unavailable.");
        setFriendRequests([]);
        setSentRequests([]);
      } else {
        console.error("Error loading friend requests:", error);
      }
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim() || !userData) return;

    try {
      const usersRef = collection(firestore, "users");
      const snapshot = await getDocs(usersRef);
      const results = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (u: any) =>
            u.uid !== userData.uid &&
            (u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      setSearchResults(results);
    } catch (error: any) {
      if (error.code === "permission-denied") {
        console.warn("Firestore rules not deployed yet. User search unavailable.");
        setSearchResults([]);
      } else {
        console.error("Error searching users:", error);
      }
    }
  };

  const sendFriendRequest = async (toUserId: string, toUserName: string) => {
    if (!userData) return;

    try {
      await addDoc(collection(firestore, "friendRequests"), {
        fromUserId: userData.uid,
        fromUserName: userData.displayName,
        toUserId,
        toUserName,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      toast({ title: "Запрос дружбы отправлен", status: "success" });
      setSentRequests([...sentRequests, { toUserId, toUserName }]);
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast({ title: "Ошибка отправки запроса", status: "error" });
    }
  };

  const acceptFriendRequest = async (requestId: string, fromUserId: string) => {
    if (!userData) return;

    try {
      // Create friendship
      await addDoc(collection(firestore, "friendships"), {
        userIds: [userData.uid, fromUserId].sort(),
        createdAt: serverTimestamp(),
      });

      // Update request status
      const requestRef = doc(firestore, "friendRequests", requestId);
      await deleteDoc(requestRef);

      toast({ title: "Запрос принят!", status: "success" });
      loadFriends();
      loadFriendRequests();
    } catch (error) {
      console.error("Error accepting request:", error);
      toast({ title: "Ошибка принятия запроса", status: "error" });
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      const requestRef = doc(firestore, "friendRequests", requestId);
      await deleteDoc(requestRef);
      toast({ title: "Запрос отклонен", status: "info" });
      loadFriendRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const removeFriend = async (_friendId: string, friendshipId: string) => {
    if (!userData) return;

    try {
      const friendshipRef = doc(firestore, "friendships", friendshipId);
      await deleteDoc(friendshipRef);
      toast({ title: "Друг удален", status: "info" });
      loadFriends();
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const isFriend = (userId: string) => friends.some((f) => f.id === userId);
  const hasSentRequest = (userId: string) =>
    sentRequests.some((r: any) => r.toUserId === userId);
  const hasReceivedRequest = (userId: string) =>
    friendRequests.some((r: any) => r.fromUserId === userId);

  return (
    <Box>
      {onBack && (
        <Button
          onClick={onBack}
          bg="rgba(255,255,255,0.1)"
          color="white"
          _hover={{ bg: "rgba(255,255,255,0.2)" }}
          size="sm"
          mb={4}
        >
          ← Назад
        </Button>
      )}
      <Heading fontSize="2xl" color="white" mb={6}>
        👫 Друзья
      </Heading>

      <Tabs colorScheme="purple" variant="enclosed">
        <TabList>
          <Tab>Мои друзья ({friends.length})</Tab>
          <Tab>Запросы ({friendRequests.length})</Tab>
          <Tab>Поиск</Tab>
        </TabList>

        <TabPanels>
          {/* Friends List */}
          <TabPanel>
            {isLoading ? (
              <Box display="flex" justifyContent="center" py={20}>
                <Spinner size="xl" color="purple.500" />
              </Box>
            ) : friends.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {friends.map((friend) => (
                  <Card
                    key={friend.id}
                    bg="rgba(255,255,255,0.05)"
                    borderRadius="xl"
                    _hover={{ bg: "rgba(255,255,255,0.08)" }}
                  >
                    <CardBody>
                      <HStack justify="space-between">
                        <HStack
                          spacing={4}
                          cursor="pointer"
                          onClick={() => onViewProfile(friend.id)}
                        >
                          <Avatar
                            size="md"
                            name={friend.displayName}
                            src={friend.avatarUrl || undefined}
                            bg="purple.600"
                          />
                          <VStack align="start" spacing={0}>
                            <HStack spacing={2}>
                              <Text
                                color={friend.nicknameColor || "white"}
                                fontWeight="bold"
                                fontSize="lg"
                              >
                                {friend.displayName}
                              </Text>
                              {friend.customTag && (
                                <Badge colorScheme="purple" fontSize="xs">
                                  {friend.customTag}
                                </Badge>
                              )}
                            </HStack>
                            <Text color="gray.400" fontSize="sm">
                              {friend.email}
                            </Text>
                          </VStack>
                        </HStack>
                        <HStack spacing={2}>
                          <FriendChatModal
                            friendId={friend.id}
                            friendName={friend.displayName}
                            friendAvatar={friend.avatarUrl}
                            friendRole={friend.role}
                          />
                          <Button
                            size="sm"
                            bg="red.600"
                            color="white"
                            _hover={{ bg: "red.700" }}
                            leftIcon={<Icon as={FiUserX} />}
                            onClick={() =>
                              removeFriend(friend.id, friend.friendshipId)
                            }
                          >
                            Удалить
                          </Button>
                        </HStack>
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
                <Icon as={FiUserPlus} w={16} h={16} color="gray.600" mb={4} />
                <Text color="gray.400" fontSize="lg">
                  У вас пока нет друзей
                </Text>
                <Text color="gray.500" fontSize="sm" mt={2}>
                  Найдите пользователей и добавьте их в друзья
                </Text>
              </Box>
            )}
          </TabPanel>

          {/* Friend Requests */}
          <TabPanel>
            {friendRequests.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {friendRequests.map((request: any) => (
                  <Card
                    key={request.id}
                    bg="rgba(255,255,255,0.05)"
                    borderRadius="xl"
                  >
                    <CardBody>
                      <HStack justify="space-between">
                        <HStack
                          spacing={4}
                          cursor="pointer"
                          onClick={() => onViewProfile(request.fromUserId)}
                        >
                          <Avatar
                            size="md"
                            name={request.fromUserName}
                            bg="purple.600"
                          />
                          <VStack align="start" spacing={0}>
                            <Text color="white" fontWeight="bold" fontSize="lg">
                              {request.fromUserName}
                            </Text>
                            <Text color="gray.400" fontSize="sm">
                              Хочет добавить вас в друзья
                            </Text>
                          </VStack>
                        </HStack>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            bg="green.600"
                            color="white"
                            _hover={{ bg: "green.700" }}
                            leftIcon={<Icon as={FiUserCheck} />}
                            onClick={() =>
                              acceptFriendRequest(
                                request.id,
                                request.fromUserId
                              )
                            }
                          >
                            Принять
                          </Button>
                          <Button
                            size="sm"
                            bg="red.600"
                            color="white"
                            _hover={{ bg: "red.700" }}
                            leftIcon={<Icon as={FiX} />}
                            onClick={() => rejectFriendRequest(request.id)}
                          >
                            Отклонить
                          </Button>
                        </HStack>
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
                <Text color="gray.400" fontSize="lg">
                  Нет входящих запросов
                </Text>
              </Box>
            )}
          </TabPanel>

          {/* Search */}
          <TabPanel>
            <InputGroup mb={6}>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Поиск по имени или email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                bg="rgba(255,255,255,0.05)"
                color="white"
                borderColor="gray.600"
                _focus={{ borderColor: "purple.500" }}
                pl={10}
              />
            </InputGroup>

            <Button
              mb={6}
              bg="purple.600"
              color="white"
              _hover={{ bg: "purple.700" }}
              onClick={searchUsers}
              leftIcon={<Icon as={FiSearch} />}
            >
              Найти пользователей
            </Button>

            {searchResults.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {searchResults.map((user: any) => (
                  <Card
                    key={user.id}
                    bg="rgba(255,255,255,0.05)"
                    borderRadius="xl"
                    _hover={{ bg: "rgba(255,255,255,0.08)" }}
                  >
                    <CardBody>
                      <HStack justify="space-between">
                        <HStack
                          spacing={4}
                          cursor="pointer"
                          onClick={() => onViewProfile(user.id)}
                        >
                          <Avatar
                            size="md"
                            name={user.displayName}
                            src={user.avatarUrl || undefined}
                            bg="purple.600"
                          />
                          <VStack align="start" spacing={0}>
                            <HStack spacing={2}>
                              <Text
                                color={user.nicknameColor || "white"}
                                fontWeight="bold"
                                fontSize="lg"
                              >
                                {user.displayName}
                              </Text>
                              {user.customTag && (
                                <Badge colorScheme="purple" fontSize="xs">
                                  {user.customTag}
                                </Badge>
                              )}
                            </HStack>
                            <Text color="gray.400" fontSize="sm">
                              {user.email}
                            </Text>
                          </VStack>
                        </HStack>
                        <HStack spacing={2}>
                          {isFriend(user.id) ? (
                            <Badge colorScheme="green" px={3} py={1}>
                              <Icon as={FiUserCheck} mr={1} />
                              В друзьях
                            </Badge>
                          ) : hasSentRequest(user.id) ? (
                            <Badge colorScheme="yellow" px={3} py={1}>
                              Запрос отправлен
                            </Badge>
                          ) : hasReceivedRequest(user.id) ? (
                            <Badge colorScheme="blue" px={3} py={1}>
                              Есть запрос
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              bg="purple.600"
                              color="white"
                              _hover={{ bg: "purple.700" }}
                              leftIcon={<Icon as={FiUserPlus} />}
                              onClick={() =>
                                sendFriendRequest(user.id, user.displayName)
                              }
                            >
                              Добавить
                            </Button>
                          )}
                        </HStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            ) : (
              searchQuery && (
                <Box
                  bg="rgba(255,255,255,0.05)"
                  borderRadius="xl"
                  p={10}
                  textAlign="center"
                >
                  <Text color="gray.400">Пользователи не найдены</Text>
                </Box>
              )
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
