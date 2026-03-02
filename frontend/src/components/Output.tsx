import { useState, useEffect, useRef } from "react";
import { Box, Text, VStack } from "@chakra-ui/react";

const Output = ({ roomId }: { roomId: string }) => {
  const [output, setOutput] = useState<string[]>([]);
  const [errorOutput, setErrorOutput] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // Connect to room WebSocket for output
    const wsUrl = `ws://${window.location.hostname}:8000/api/ws/rooms/${roomId}`;
    console.log("Connecting to WebSocket:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Output connected to room:", roomId);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      
      if (msg.type === "run.stdout") {
        setOutput((prev) => [...prev, msg.chunk]);
      } else if (msg.type === "run.stderr") {
        setErrorOutput((prev) => [...prev, msg.chunk]);
      }
    };

    ws.onerror = (error) => {
      console.error("Output WebSocket error:", error);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomId]);

  return (
    <Box
      w="50%"
      h="70vh"
      bg="#1a1a2e"
      borderRadius="md"
      p={4}
      border="1px solid"
      borderColor="gray.700"
      overflowY="auto"
    >
      <Text color="teal.400" fontSize="lg" fontWeight="bold" mb={4}>
        Output
      </Text>

      {output.length === 0 && errorOutput.length === 0 ? (
        <Text color="gray.500" fontSize="sm">
          Run code to see output...
        </Text>
      ) : (
        <VStack align="stretch" spacing={2}>
          {output.map((line, i) => (
            <Text key={`out-${i}`} color="gray.300" fontSize="sm" fontFamily="mono">
              {line}
            </Text>
          ))}
          {errorOutput.map((line, i) => (
            <Text key={`err-${i}`} color="red.400" fontSize="sm" fontFamily="mono">
              {line}
            </Text>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default Output;
