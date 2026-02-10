import { useEffect, useState } from "react";
import { Box, Button, HStack, Text } from "@chakra-ui/react";
<<<<<<< HEAD
import { firestore } from "../main";
=======
import { firestore } from "../main"; // Импорт вашей конфигурации
>>>>>>> c188b87e1c9a298710c3eea8beae062c0353604e
import { doc, updateDoc, onSnapshot } from "firebase/firestore";

const Timer = ({ roomId }: { roomId: string }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  // 1. СЛУШАЕМ FIREBASE
  useEffect(() => {
    const roomRef = doc(firestore, "rooms", roomId);
    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        if (data.timer) {
          // ОБНОВЛЕНИЕ СОСТОЯНИЯ
          if (data.timer.status === "running") {
            setIsActive(true);
            setStartTime(data.timer.startTime);
          } else if (data.timer.status === "stopped") {
            setIsActive(false);
            setStartTime(null);
            // Важно: при остановке берем сохраненное время из базы
            if (data.timer.elapsed !== undefined) {
                setSeconds(data.timer.elapsed);
            }
          } else {
            // Статус "idle" (Сброс)
            setIsActive(false);
            setStartTime(null);
            setSeconds(0);
          }
        }
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  // 2. ТИКАЕМ ЛОКАЛЬНО
  useEffect(() => {
    let interval: any = null;

    if (isActive && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((now - startTime) / 1000);
        setSeconds(diff >= 0 ? diff : 0);
      }, 1000);
    } 
    // УБРАЛИ БЛОК "else", который сбрасывал время в 0.
    // Теперь сброс происходит только если прилетит статус "idle" из первого useEffect.

    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // --- ФУНКЦИИ УПРАВЛЕНИЯ ---

  const startTimer = async () => {
    const roomRef = doc(firestore, "rooms", roomId);
    await updateDoc(roomRef, {
      timer: {
        status: "running",
        startTime: Date.now(),
        elapsed: 0
      }
    });
  };

  const stopTimer = async () => {
    const roomRef = doc(firestore, "rooms", roomId);
    await updateDoc(roomRef, {
      timer: {
        status: "stopped",
        startTime: null,
        elapsed: seconds // Сохраняем то, что натикало
      }
    });
  };

  const resetTimer = async () => {
    const roomRef = doc(firestore, "rooms", roomId);
    await updateDoc(roomRef, {
      timer: {
        status: "idle", // Новый статус для полного сброса
        startTime: null,
        elapsed: 0
      }
    });
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Box 
      bg="rgba(255, 255, 255, 0.05)" 
      p={2} 
      borderRadius="md" 
      border="1px solid" 
      borderColor="gray.700"
    >
      <HStack spacing={4}>
        <Text fontSize="2xl" fontWeight="bold" fontFamily="monospace" color={isActive ? "green.300" : "white"}>
          {formatTime(seconds)}
        </Text>
        
        <HStack spacing={2}>
          {!isActive ? (
            <Button size="sm" colorScheme="green" onClick={startTimer}>
              Start
            </Button>
          ) : (
             <Button size="sm" colorScheme="red" onClick={stopTimer}>
              Stop
            </Button>
          )}
          
          <Button size="sm" variant="ghost" color="gray.400" onClick={resetTimer}>
            Reset
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};

export default Timer;