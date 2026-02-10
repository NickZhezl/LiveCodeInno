import { useEffect, useState } from "react";
import { Box, Button, HStack, Text } from "@chakra-ui/react";
import { firestore } from "../main"; // Импорт вашей конфигурации
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
// Можете использовать иконки, если хотите (npm install react-icons)
// import { FaPlay, FaStop, FaRedo } from "react-icons/fa";

const Timer = ({ roomId }: { roomId: string }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  // 1. СЛУШАЕМ FIREBASE (Синхронизация состояния)
  useEffect(() => {
    const roomRef = doc(firestore, "rooms", roomId);
    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Если в базе есть таймер
        if (data.timer) {
          setIsActive(data.timer.status === "running");
          setStartTime(data.timer.startTime);
          
          // Если таймер остановлен, показываем зафиксированное время
          if (data.timer.status === "stopped" && data.timer.elapsed) {
            setSeconds(data.timer.elapsed);
          }
        }
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  // 2. ТИКАЕМ ЛОКАЛЬНО (Каждую секунду обновляем экран)
  useEffect(() => {
    let interval: any = null;

    if (isActive && startTime) {
      interval = setInterval(() => {
        // Вычисляем, сколько прошло времени с момента старта
        const now = Date.now();
        const diff = Math.floor((now - startTime) / 1000);
        setSeconds(diff >= 0 ? diff : 0);
      }, 1000);
    } else if (!isActive && startTime === null) {
      // Сброс
      setSeconds(0);
    }

    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // --- ФУНКЦИИ УПРАВЛЕНИЯ ---

  const startTimer = async () => {
    // Записываем в базу текущее время сервера (клиента) как точку отсчета
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
    // Фиксируем текущее значение
    const roomRef = doc(firestore, "rooms", roomId);
    await updateDoc(roomRef, {
      timer: {
        status: "stopped",
        startTime: null, // Сбрасываем старт, чтобы не тикало
        elapsed: seconds // Сохраняем результат
      }
    });
  };

  const resetTimer = async () => {
    const roomRef = doc(firestore, "rooms", roomId);
    await updateDoc(roomRef, {
      timer: {
        status: "idle",
        startTime: null,
        elapsed: 0
      }
    });
  };

  // Форматирование времени (MM:SS)
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