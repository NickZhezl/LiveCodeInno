import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Badge,
  Select,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { FiBook, FiCode, FiLink } from "react-icons/fi";
import { Editor } from "@monaco-editor/react";
import ReactMarkdown from 'react-markdown';

interface Topic {
  id: string;
  category: string;
  level: number;
  title: string;
  description: string;
  cheatSheet: string;
  theory: string;
  materials: { type: 'video' | 'article' | 'link'; title: string; url: string; description?: string }[];
  codeExamples: { title: string; code: string }[];
  tasks?: { title: string; description: string; starterCode: string; expectedOutput: string; solution: string }[];
}

interface GenericTopicsProps {
  topics: Topic[];
  title: string;
  icon: React.ElementType;
  colorScheme: string;
  onBack: () => void;
}

export default function GenericTopics({ topics, title, icon: IconComponent, colorScheme, onBack }: GenericTopicsProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");

  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  const difficultyColors: Record<number, string> = {
    1: "green",
    2: "green",
    3: "green",
    4: "yellow",
    5: "yellow",
    6: "yellow",
    7: "red",
    8: "red",
    9: "red",
  };

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
              <Icon as={IconComponent} mr={2} />
              {title}
            </Heading>
          </HStack>
          <Badge colorScheme={colorScheme} fontSize="md" px={4} py={2} borderRadius="full">
            {topics.length} тем
          </Badge>
        </HStack>
      </Box>

      <HStack align="flex-start" p={6} spacing={6}>
        {/* Topic List */}
        <Box flex={1} maxW="400px">
          <VStack spacing={3} align="stretch">
            <Select
              placeholder="Выберите тему..."
              bg="gray.800"
              color="white"
              borderColor="gray.600"
              onChange={(e) => setSelectedTopicId(e.target.value)}
              value={selectedTopicId}
            >
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id} style={{ backgroundColor: "#2D3748", color: "white" }}>
                  {topic.title} (Уровень {topic.level})
                </option>
              ))}
            </Select>

            <VStack spacing={2} align="stretch" maxH="600px" overflowY="auto">
              {topics.map((topic) => (
                <Card
                  key={topic.id}
                  bg={selectedTopicId === topic.id ? "rgba(255, 165, 0, 0.2)" : "rgba(255,255,255,0.05)"}
                  borderRadius="xl"
                  cursor="pointer"
                  _hover={{ bg: "rgba(255,255,255,0.1)" }}
                  onClick={() => setSelectedTopicId(topic.id)}
                >
                  <CardBody>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium" fontSize="sm" color="white">
                          {topic.title}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {topic.category}
                        </Text>
                      </VStack>
                      <Badge colorScheme={difficultyColors[topic.level] || "gray"}>
                        {topic.level}
                      </Badge>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </VStack>
        </Box>

        {/* Topic Content */}
        <Box flex={2}>
          {selectedTopic ? (
            <VStack spacing={6} align="stretch">
              <Box>
                <HStack spacing={2} mb={2}>
                  <Heading fontSize="xl" color="white">{selectedTopic.title}</Heading>
                  <Badge colorScheme={difficultyColors[selectedTopic.level] || "gray"}>
                    Уровень {selectedTopic.level}
                  </Badge>
                </HStack>
                <Text color="gray.400">{selectedTopic.description}</Text>
              </Box>

              <Accordion allowMultiple defaultIndex={[0]}>
                {/* Theory */}
                <AccordionItem border="1px solid rgba(255,255,255,0.1)" borderRadius="lg" mb={4}>
                  <AccordionButton bg="rgba(255,255,255,0.05)" _hover={{ bg: "rgba(255,255,255,0.1)" }}>
                    <Box flex="1" textAlign="left" fontWeight="medium" color="white">
                      <Icon as={FiBook} mr={2} />
                      Теория
                    </Box>
                    <AccordionIcon color="gray.400" />
                  </AccordionButton>
                  <AccordionPanel pb={4} bg="rgba(0,0,0,0.2)">
                    <Box color="gray.200" maxH="500px" overflowY="auto">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <Text as="h1" fontSize="2xl" fontWeight="bold" color="white" my={4} {...props} />,
                          h2: ({node, ...props}) => <Text as="h2" fontSize="xl" fontWeight="bold" color="white" my={3} {...props} />,
                          h3: ({node, ...props}) => <Text as="h3" fontSize="lg" fontWeight="bold" color="white" my={2} {...props} />,
                          p: ({node, ...props}) => <Text as="p" my={2} {...props} />,
                          code: ({node, inline, ...props}: any) =>
                            inline ?
                              <Text as="span" bg="rgba(255,255,255,0.1)" px={2} py={1} borderRadius="md" fontFamily="mono" fontSize="sm" {...props} /> :
                              <Box as="pre" bg="rgba(0,0,0,0.5)" p={3} borderRadius="md" my={2} overflowX="auto"><Text as="code" fontFamily="mono" fontSize="sm" {...props} /></Box>,
                          ul: ({node, ...props}) => <Box as="ul" pl={4} my={2} {...props} />,
                          ol: ({node, ...props}) => <Box as="ol" pl={4} my={2} {...props} />,
                          li: ({node, ...props}) => <Box as="li" my={1} {...props} />,
                        }}
                      >
                        {selectedTopic.theory}
                      </ReactMarkdown>
                    </Box>
                  </AccordionPanel>
                </AccordionItem>

                {/* Cheat Sheet */}
                <AccordionItem border="1px solid rgba(255,255,255,0.1)" borderRadius="lg" mb={4}>
                  <AccordionButton bg="rgba(255,255,255,0.05)" _hover={{ bg: "rgba(255,255,255,0.1)" }}>
                    <Box flex="1" textAlign="left" fontWeight="medium" color="white">
                      <Icon as={FiCode} mr={2} />
                      Шпаргалка
                    </Box>
                    <AccordionIcon color="gray.400" />
                  </AccordionButton>
                  <AccordionPanel pb={4} bg="rgba(0,0,0,0.2)">
                    <Box
                      bg="rgba(0,0,0,0.3)"
                      borderRadius="md"
                      p={4}
                      color="gray.200"
                      maxH="400px"
                      overflowY="auto"
                      fontFamily="mono"
                      fontSize="sm"
                      whiteSpace="pre-wrap"
                    >
                      {selectedTopic.cheatSheet}
                    </Box>
                  </AccordionPanel>
                </AccordionItem>

                {/* Code Examples */}
                {selectedTopic.codeExamples && selectedTopic.codeExamples.length > 0 && (
                  <AccordionItem border="1px solid rgba(255,255,255,0.1)" borderRadius="lg" mb={4}>
                    <AccordionButton bg="rgba(255,255,255,0.05)" _hover={{ bg: "rgba(255,255,255,0.1)" }}>
                      <Box flex="1" textAlign="left" fontWeight="medium" color="white">
                        <Icon as={FiCode} mr={2} />
                        Примеры кода ({selectedTopic.codeExamples.length})
                      </Box>
                      <AccordionIcon color="gray.400" />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <VStack spacing={4} align="stretch">
                        {selectedTopic.codeExamples.map((example, idx) => (
                          <Box key={idx}>
                            <Text color="white" fontWeight="bold" mb={2}>{example.title}</Text>
                            <Editor
                              height="200px"
                              theme="vs-dark"
                              language="python"
                              value={example.code}
                              options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                fontSize: 13,
                                scrollBeyondLastLine: false,
                              }}
                            />
                          </Box>
                        ))}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                )}

                {/* Materials */}
                {selectedTopic.materials && selectedTopic.materials.length > 0 && (
                  <AccordionItem border="1px solid rgba(255,255,255,0.1)" borderRadius="lg" mb={4}>
                    <AccordionButton bg="rgba(255,255,255,0.05)" _hover={{ bg: "rgba(255,255,255,0.1)" }}>
                      <Box flex="1" textAlign="left" fontWeight="medium" color="white">
                        <Icon as={FiLink} mr={2} />
                        Дополнительные материалы
                      </Box>
                      <AccordionIcon color="gray.400" />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <VStack spacing={3} align="stretch">
                        {selectedTopic.materials.map((mat, idx) => (
                          <Box
                            key={idx}
                            as="a"
                            href={mat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            bg="rgba(0,100,255,0.1)"
                            borderRadius="lg"
                            p={3}
                            border="1px solid rgba(0,100,255,0.3)"
                            _hover={{ bg: "rgba(0,100,255,0.2)" }}
                            cursor="pointer"
                          >
                            <HStack spacing={2}>
                              <Badge colorScheme={mat.type === 'video' ? 'red' : mat.type === 'article' ? 'blue' : 'green'}>
                                {mat.type === 'video' ? '📹' : mat.type === 'article' ? '📄' : '🔗'} {mat.type}
                              </Badge>
                              <Text color="blue.300" fontWeight="bold">{mat.title}</Text>
                            </HStack>
                            {mat.description && (
                              <Text color="gray.400" fontSize="sm" mt={1}>{mat.description}</Text>
                            )}
                          </Box>
                        ))}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                )}
              </Accordion>
            </VStack>
          ) : (
            <Box h="full" display="flex" alignItems="center" justifyContent="center" color="gray.500">
              <VStack spacing={4}>
                <Icon as={IconComponent} w={16} h={16} />
                <Text>Выберите тему для изучения</Text>
              </VStack>
            </Box>
          )}
        </Box>
      </HStack>
    </Box>
  );
}
