import { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  VStack,
  HStack,
  Icon,
  Button,
} from "@chakra-ui/react";
import { StarIcon, TimeIcon } from "@chakra-ui/icons";
import { getLeaderboard } from "../api/client";

interface LeaderboardEntry {
  id: number;
  room_id: string;
  userName: string;
  problemId: string;
  problemTitle: string;
  timeSeconds: number;
  timestamp: any;
  language: string;
}

interface LeaderboardProps {
  roomId: string;
  currentProblemId?: string;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const getMedalColor = (rank: number) => {
  if (rank === 1) return "yellow.400";
  if (rank === 2) return "gray.400";
  if (rank === 3) return "orange.400";
  return "transparent";
};

const getLanguageBadge = (language: string) => {
  const colorScheme = language === "python" ? "blue" : "green";
  const label = language === "postgresql" ? "SQL" : language.toUpperCase();
  return (
    <Badge colorScheme={colorScheme} fontSize="xs">
      {label}
    </Badge>
  );
};

export const Leaderboard = ({ roomId, currentProblemId }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filterMode, setFilterMode] = useState<"all" | "current">("all");

  useEffect(() => {
    if (!roomId) return;

    // Fetch leaderboard from API
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard(roomId, filterMode === "current" ? currentProblemId : undefined);
        setEntries(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      }
    };

    fetchLeaderboard();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchLeaderboard, 5000);
    
    return () => clearInterval(interval);
  }, [roomId, filterMode, currentProblemId]);

  // Filter by current problem if selected
  const filteredEntries =
    filterMode === "current" && currentProblemId
      ? entries.filter((e) => e.problemId === currentProblemId)
      : entries;

  return (
    <Box
      bg="gray.800"
      borderRadius="lg"
      p={4}
      maxH="600px"
      overflowY="auto"
      border="1px solid"
      borderColor="gray.700"
    >
      <HStack justify="space-between" mb={4}>
        <HStack>
          <Icon as={StarIcon} color="yellow.400" w={5} h={5} />
          <Text color="white" fontSize="xl" fontWeight="bold">
            Leaderboard
          </Text>
        </HStack>
        <HStack spacing={2}>
          <Button
            size="sm"
            variant={filterMode === "all" ? "solid" : "outline"}
            colorScheme={filterMode === "all" ? "teal" : "gray"}
            onClick={() => setFilterMode("all")}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filterMode === "current" ? "solid" : "outline"}
            colorScheme={filterMode === "current" ? "teal" : "gray"}
            onClick={() => setFilterMode("current")}
            isDisabled={!currentProblemId}
          >
            Current
          </Button>
        </HStack>
      </HStack>

      {filteredEntries.length === 0 ? (
        <Text color="gray.500" textAlign="center" py={8}>
          No submissions yet. Be the first to solve a problem!
        </Text>
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th color="gray.400">#</Th>
              <Th color="gray.400">User</Th>
              <Th color="gray.400">Problem</Th>
              <Th color="gray.400">Time</Th>
              <Th color="gray.400">Lang</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredEntries.map((entry, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;

              return (
                <Tr
                  key={entry.id}
                  bg={
                    isTopThree
                      ? getMedalColor(rank)
                      : "transparent"
                  }
                  _hover={{ bg: "gray.700" }}
                >
                  <Td>
                    <HStack>
                      {isTopThree && (
                        <Icon
                          as={StarIcon}
                          color={getMedalColor(rank)}
                          w={4}
                          h={4}
                        />
                      )}
                      <Text
                        color={isTopThree ? "white" : "gray.400"}
                        fontWeight={isTopThree ? "bold" : "normal"}
                      >
                        {rank}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Text color="white" fontWeight="medium">
                      {entry.userName}
                    </Text>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={0}>
                      <Text color="gray.300" fontSize="sm" noOfLines={1}>
                        {entry.problemTitle}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <HStack>
                      <Icon as={TimeIcon} color="teal.400" w={3} h={3} />
                      <Text color="teal.400" fontWeight="bold" fontFamily="mono">
                        {formatTime(entry.timeSeconds)}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>{getLanguageBadge(entry.language)}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default Leaderboard;
