import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { FiBook } from "react-icons/fi";
import { PYTHON_TOPICS } from "../data/pythonTopics";
import { Editor } from "@monaco-editor/react";

interface TopicsProps {
  onBack: () => void;
}

export default function Topics({ onBack }: TopicsProps) {
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

  const groupedTopics = PYTHON_TOPICS.reduce((acc, topic) => {
    if (!acc[topic.category]) {
      acc[topic.category] = [];
    }
    acc[topic.category].push(topic);
    return acc;
  }, {} as Record<string, typeof PYTHON_TOPICS>);

  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500">
      {/* Header */}
      <Box p={6} borderBottom="1px solid rgba(255,255,255,0.1)">
        <HStack justify="space-between">
          <HStack spacing={4}>
            <Button
              onClick={onBack}
              bg="rgba(255,255,255,0.1)"
              color="white"
              _hover={{ bg: "rgba(255,255,255,0.2)" }}
              size="sm"
            >
              ← Назад
            </Button>
            <Heading fontSize="2xl" color="white">
              Темы Python
            </Heading>
          </HStack>
          <Badge colorScheme="blue" fontSize="md" px={4} py={2} borderRadius="full">
            {PYTHON_TOPICS.length} тем
          </Badge>
        </HStack>
      </Box>

      <HStack align="flex-start" p={6} spacing={6}>
        {/* Topics List */}
        <Box flex={1} maxW="400px">
          <VStack spacing={4} align="stretch">
            {Object.entries(groupedTopics).map(([category, topics]) => (
              <Box key={category}>
                <Text fontSize="lg" fontWeight="bold" color="white" mb={3}>
                  {category}
                </Text>
                <VStack spacing={2} align="stretch">
                  {topics.map((topic) => {
                    const globalIdx = PYTHON_TOPICS.findIndex(t => t.id === topic.id);
                    return (
                      <Button
                        key={topic.id}
                        onClick={() => {
                          setSelectedTopic(globalIdx);
                        }}
                        bg={selectedTopic === globalIdx ? "purple.600" : "rgba(255,255,255,0.05)"}
                        color={selectedTopic === globalIdx ? "white" : "gray.400"}
                        _hover={{ bg: selectedTopic === globalIdx ? "purple.700" : "rgba(255,255,255,0.1)" }}
                        justifyContent="flex-start"
                        px={4}
                        py={6}
                        borderRadius="lg"
                      >
                        <VStack align="start" spacing={1}>
                          <HStack spacing={2}>
                            <Icon as={FiBook} w={4} h={4} />
                            <Text fontWeight="medium">{topic.title}</Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.500">
                            {topic.description}
                          </Text>
                        </VStack>
                      </Button>
                    );
                  })}
                </VStack>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Content Area */}
        <Box flex={2}>
          {selectedTopic !== null ? (
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading fontSize="xl" color="white" mb={2}>
                  {PYTHON_TOPICS[selectedTopic].title}
                </Heading>
                <Text color="gray.400">
                  {PYTHON_TOPICS[selectedTopic].description}
                </Text>
              </Box>

              <Accordion allowMultiple defaultIndex={[0]}>
                {PYTHON_TOPICS[selectedTopic].materials.map((material, idx) => (
                  <AccordionItem
                    key={idx}
                    border="1px solid rgba(255,255,255,0.1)"
                    borderRadius="lg"
                    mb={4}
                  >
                    <AccordionButton
                      bg="rgba(255,255,255,0.05)"
                      _hover={{ bg: "rgba(255,255,255,0.1)" }}
                      borderRadius="lg"
                    >
                      <Box flex="1" textAlign="left" fontWeight="medium" color="white">
                        {material.title}
                      </Box>
                      <AccordionIcon color="gray.400" />
                    </AccordionButton>
                    <AccordionPanel pb={4} bg="rgba(0,0,0,0.2)">
                      <Box mb={4}>
                        <Editor
                          height="300px"
                          theme="vs-dark"
                          language="python"
                          value={material.content}
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                          }}
                        />
                      </Box>
                      <Box p={4} bg="purple.900" borderRadius="md" borderLeft="4px solid purple">
                        <Text color="white" fontWeight="bold" mb={2}>
                          Задание:
                        </Text>
                        <Text color="gray.200">{material.task}</Text>
                      </Box>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </VStack>
          ) : (
            <Box
              h="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="gray.500"
            >
              <VStack spacing={4}>
                <Icon as={FiBook} w={16} h={16} />
                <Text>Выберите тему для изучения</Text>
              </VStack>
            </Box>
          )}
        </Box>
      </HStack>
    </Box>
  );
}
