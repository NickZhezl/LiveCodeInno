import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Button,
  Icon,
  Text,
  VStack,
  HStack,
  Avatar,
  Badge,
} from "@chakra-ui/react";
import { FiMessageSquare } from "react-icons/fi";
import Chat from "./Chat";
import { firestore } from "../main";
import { doc, getDoc } from "firebase/firestore";

interface FriendChatModalProps {
  friendId: string;
  friendName: string;
  friendAvatar?: string;
  friendRole?: string;
  triggerButton?: React.ReactNode;
}

export default function FriendChatModal({
  friendId,
  friendName,
  friendAvatar,
  friendRole = "user",
  triggerButton,
}: FriendChatModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && friendId) {
      loadUserData();
    }
  }, [isOpen, friendId]);

  const loadUserData = async () => {
    try {
      const userRef = doc(firestore, "users", friendId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const chatUser = {
    uid: friendId,
    displayName: friendName,
    email: userData?.email || "",
    role: (userData?.role || friendRole) as "user" | "admin",
    avatarUrl: friendAvatar || userData?.avatarUrl,
    nicknameColor: userData?.nicknameColor || "#ffffff",
    customTag: userData?.customTag || "",
  };

  const defaultButton = (
    <Button
      size="sm"
      bg="purple.600"
      color="white"
      _hover={{ bg: "purple.700" }}
      leftIcon={<Icon as={FiMessageSquare} />}
      onClick={onOpen}
    >
      Написать
    </Button>
  );

  return (
    <>
      {triggerButton || defaultButton}

      <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent bg="gray.800" maxH="80vh">
          <ModalHeader color="white">
            <HStack spacing={3}>
              <Avatar size="sm" name={friendName} src={friendAvatar || undefined} bg="purple.600" />
              <VStack align="start" spacing={0}>
                <HStack spacing={2}>
                  <Text color={userData?.nicknameColor || "white"} fontWeight="bold">
                    {friendName}
                  </Text>
                  {userData?.customTag && (
                    <Badge colorScheme="purple" fontSize="xs">
                      {userData.customTag}
                    </Badge>
                  )}
                </HStack>
                <Text color="gray.400" fontSize="xs">
                  {userData?.role === "admin" ? "Админ" : "Пользователь"}
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Chat
              chatWith={chatUser}
              onClose={onClose}
              onViewProfile={() => {}}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
