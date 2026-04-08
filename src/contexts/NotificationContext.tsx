import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useToast } from "@chakra-ui/react";
import { firestore } from "../main";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { useAuth } from "./AuthContext";

interface Notification {
  id: string;
  type: "message" | "achievement" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
});

export function useNotifications() {
  const context = useContext(NotificationContext);
  return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { userData } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const processedMessageIds = useRef<Set<string>>(new Set());

  // Listen for new messages in real-time
  useEffect(() => {
    if (!userData) return;

    // Listen to all chat rooms where user is a participant
    const chatRoomsRef = collection(firestore, "chatRooms");
    const q = query(chatRoomsRef);

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const userRooms = snapshot.docs.filter((doc) => {
        const data = doc.data();
        return data.participants?.includes(userData.uid);
      });

      // For each room, check for new unread messages
      for (const roomDoc of userRooms) {
        const messagesRef = collection(firestore, `chatRooms/${roomDoc.id}/messages`);
        const msgQuery = query(messagesRef, where("read", "==", false));
        
        const msgSnapshot = await getDocs(msgQuery);
        const unreadMessages = msgSnapshot.docs.filter(
          (msg) => msg.data().senderId !== userData.uid
        );

        // Show notification for new messages
        if (unreadMessages.length > 0) {
          const latestMsg = unreadMessages[unreadMessages.length - 1];
          
          // Skip if already processed
          if (processedMessageIds.current.has(latestMsg.id)) {
            continue;
          }
          processedMessageIds.current.add(latestMsg.id);
          
          const msgData = latestMsg.data();
          
          const newNotification: Notification = {
            id: latestMsg.id,
            type: "message",
            title: `Новое сообщение от ${msgData.senderName}`,
            message: msgData.text.substring(0, 100) + (msgData.text.length > 100 ? "..." : ""),
            timestamp: msgData.timestamp?.toDate() || new Date(),
            read: false,
            data: {
              chatRoomId: roomDoc.id,
              senderId: msgData.senderId,
              senderName: msgData.senderName,
              messageId: latestMsg.id,
            },
          };

          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Show toast notification
          toast({
            title: "💬 Новое сообщение",
            description: `${msgData.senderName}: ${msgData.text.substring(0, 50)}${
              msgData.text.length > 50 ? "..." : ""
            }`,
            status: "info",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
        }
      }
    });

    return () => unsubscribe();
  }, [userData, toast]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
