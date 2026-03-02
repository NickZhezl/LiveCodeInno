import { useEffect, useState } from "react";
import { Box, Button, HStack, Text } from "@chakra-ui/react";

const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Timer runs locally - no need for Firebase sync
  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive]);

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
            <Button size="sm" colorScheme="green" onClick={() => setIsActive(true)}>
              Start
            </Button>
          ) : (
             <Button size="sm" colorScheme="red" onClick={() => setIsActive(false)}>
              Stop
            </Button>
          )}

          <Button size="sm" variant="ghost" color="gray.400" onClick={() => {
            setIsActive(false);
            setSeconds(0);
          }}>
            Reset
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};

export default Timer;
