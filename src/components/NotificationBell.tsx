import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
} from "@chakra-ui/react";
import { FiBell, FiMessageSquare, FiCheck, FiTrash, FiArrowLeft } from "react-icons/fi";
import { useNotifications } from "../contexts/NotificationContext";

interface NotificationBellProps {
  onViewUserProfile?: (userId: string) => void;
  onBack?: () => void;
}

export default function NotificationBell({ onViewUserProfile, onBack }: NotificationBellProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Только что";
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return `${days} д назад`;
  };

  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500" p={6}>
      {onBack && (
        <Button
          onClick={onBack}
          bg="rgba(255,255,255,0.1)"
          color="white"
          _hover={{ bg: "rgba(255,255,255,0.2)" }}
          size="sm"
          leftIcon={<Icon as={FiArrowLeft} />}
          mb={4}
        >
          Назад
        </Button>
      )}
      <Popover placement="bottom-end" isOpen={true}>
      <PopoverTrigger>
        <Button
          position="relative"
          bg="rgba(255,255,255,0.1)"
          color="white"
          _hover={{ bg: "rgba(255,255,255,0.2)" }}
          size="sm"
          leftIcon={<Icon as={FiBell} />}
        >
          Уведомления
          {unreadCount > 0 && (
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
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent bg="gray.800" borderColor="gray.600" maxW="400px">
        <PopoverArrow bg="gray.600" />
        <PopoverCloseButton />
        <PopoverHeader color="white" fontWeight="bold">
          <HStack justify="space-between">
            <Text>Уведомления</Text>
            {unreadCount > 0 && (
              <Badge colorScheme="red">{unreadCount} новых</Badge>
            )}
          </HStack>
        </PopoverHeader>

        <PopoverBody maxH="400px" overflowY="auto">
          {notifications.length > 0 ? (
            <VStack spacing={3} align="stretch">
              {notifications.slice(0, 10).map((notif) => (
                <Box
                  key={notif.id}
                  bg={notif.read ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)"}
                  borderRadius="md"
                  p={3}
                  borderLeft="3px solid"
                  borderColor={notif.read ? "gray.600" : "purple.500"}
                  cursor="pointer"
                  _hover={{ bg: "rgba(255,255,255,0.1)" }}
                  onClick={() => {
                    if (!notif.read) {
                      markAsRead(notif.id);
                    }
                    if (notif.type === "message" && notif.data?.senderId) {
                      onViewUserProfile?.(notif.data.senderId);
                    }
                  }}
                >
                  <HStack justify="space-between" mb={1}>
                    <HStack spacing={2}>
                      <Icon
                        as={notif.type === "message" ? FiMessageSquare : FiBell}
                        color={notif.read ? "gray.500" : "purple.400"}
                      />
                      <Text color="white" fontWeight="bold" fontSize="sm">
                        {notif.title}
                      </Text>
                    </HStack>
                    {!notif.read && (
                      <Badge colorScheme="purple" fontSize="xs">
                        Новое
                      </Badge>
                    )}
                  </HStack>
                  <Text color="gray.400" fontSize="xs" mb={2}>
                    {notif.message}
                  </Text>
                  <HStack justify="space-between">
                    <Text color="gray.500" fontSize="xs">
                      {formatTime(notif.timestamp)}
                    </Text>
                    {!notif.read && (
                      <Button
                        size="xs"
                        bg="rgba(255,255,255,0.1)"
                        color="white"
                        _hover={{ bg: "rgba(255,255,255,0.2)" }}
                        leftIcon={<Icon as={FiCheck} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                        }}
                      >
                        Прочитать
                      </Button>
                    )}
                  </HStack>
                </Box>
              ))}
            </VStack>
          ) : (
            <Box textAlign="center" py={10} color="gray.500">
              <Icon as={FiBell} w={12} h={12} mb={3} />
              <Text>Нет уведомлений</Text>
            </Box>
          )}
        </PopoverBody>

        {notifications.length > 0 && (
          <PopoverFooter borderTop="1px solid" borderColor="gray.600">
            <HStack spacing={2} justify="space-between">
              <Button
                size="xs"
                bg="rgba(255,255,255,0.1)"
                color="white"
                _hover={{ bg: "rgba(255,255,255,0.2)" }}
                leftIcon={<Icon as={FiCheck} />}
                onClick={markAllAsRead}
              >
                Прочитать все
              </Button>
              <Button
                size="xs"
                bg="rgba(255,0,0,0.2)"
                color="white"
                _hover={{ bg: "rgba(255,0,0,0.3)" }}
                leftIcon={<Icon as={FiTrash} />}
                onClick={clearNotifications}
              >
                Очистить
              </Button>
            </HStack>
          </PopoverFooter>
        )}
      </PopoverContent>
    </Popover>
    </Box>
  );
}
