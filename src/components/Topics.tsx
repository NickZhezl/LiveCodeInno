import { useState, useEffect } from "react";
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
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
} from "@chakra-ui/react";
import { FiSearch, FiBook, FiCode } from "react-icons/fi";
import { Editor } from "@monaco-editor/react";
import ReactMarkdown from 'react-markdown';
import { Topic, getTopics, initializeDefaultTopics } from "../services/topicsService";

interface TopicsProps {
  onBack: () => void;
}

export default function Topics({ onBack }: TopicsProps) {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopics();
  }, []);

  async function loadTopics() {
    setLoading(true);
    try {
      await initializeDefaultTopics();
      const allTopics = await getTopics();
      setTopics(allTopics);
      setFilteredTopics(allTopics);
    } catch (error) {
      console.error("Error loading topics:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      const results = topics.filter(topic => 
        topic.title.toLowerCase().includes(lowerQuery) ||
        topic.description.toLowerCase().includes(lowerQuery) ||
        topic.theory.toLowerCase().includes(lowerQuery) ||
        topic.cheatSheet.toLowerCase().includes(lowerQuery) ||
        topic.category.toLowerCase().includes(lowerQuery)
      );
      setFilteredTopics(results);
    } else {
      setFilteredTopics(topics);
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="#0f0a19" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="purple.500" />
      </Box>
    );
  }

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
              Учебные материалы по Python
            </Heading>
          </HStack>
          <Badge colorScheme="blue" fontSize="md" px={4} py={2} borderRadius="full">
            {topics.length} тем
          </Badge>
        </HStack>
      </Box>

      {/* Search Bar */}
      <Box p={6} pb={0}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Поиск тем (например: Meta, функция, класс)..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            bg="rgba(255,255,255,0.05)"
            border="1px solid rgba(255,255,255,0.1)"
            color="white"
            _placeholder={{ color: "gray.500" }}
            focusBorderColor="purple.500"
          />
        </InputGroup>
        {searchQuery && (
          <Text fontSize="sm" color="gray.400" mt={2}>
            Найдено: {filteredTopics.length}
          </Text>
        )}
      </Box>

      <HStack align="flex-start" p={6} spacing={6}>
        {/* Topics List */}
        <Box flex={1} maxW="400px">
          <VStack spacing={2} align="stretch" maxH="600px" overflowY="auto">
            {filteredTopics.length === 0 ? (
              <Box p={6} textAlign="center" color="gray.500">
                <Icon as={FiBook} w={12} h={12} mx="auto" mb={4} />
                <Text>Ничего не найдено</Text>
              </Box>
            ) : (
              filteredTopics.map((topic) => (
                <Button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  bg={selectedTopic?.id === topic.id ? "purple.600" : "rgba(255,255,255,0.05)"}
                  color={selectedTopic?.id === topic.id ? "white" : "gray.400"}
                  _hover={{ bg: selectedTopic?.id === topic.id ? "purple.700" : "rgba(255,255,255,0.1)" }}
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
              ))
            )}
          </VStack>
        </Box>

        {/* Content Area */}
        <Box flex={2}>
          {selectedTopic ? (
            <VStack spacing={6} align="stretch">
              <Box>
                <HStack spacing={2} mb={2}>
                  <Badge colorScheme="blue">{selectedTopic.category}</Badge>
                  <Badge colorScheme="yellow">Уровень {selectedTopic.level}</Badge>
                </HStack>
                <Heading fontSize="2xl" color="white" mb={2}>
                  {selectedTopic.title}
                </Heading>
                <Text color="gray.400">
                  {selectedTopic.description}
                </Text>
              </Box>

              {/* Materials */}
              {selectedTopic.materials && selectedTopic.materials.length > 0 && (
                <Box>
                  <HStack spacing={2} mb={3}>
                    <Icon as={FiBook} w={5} h={5} color="blue.400" />
                    <Text color="white" fontWeight="bold" fontSize="lg">
                      🔗 Дополнительные материалы
                    </Text>
                  </HStack>
                  <VStack spacing={2} align="stretch">
                    {selectedTopic.materials.map((mat: any, idx: number) => (
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
                </Box>
              )}

              {/* Cheat Sheet */}
              {selectedTopic.cheatSheet && (
                <Box>
                  <HStack spacing={2} mb={3}>
                    <Icon as={FiBook} w={5} h={5} color="green.400" />
                    <Text color="white" fontWeight="bold" fontSize="lg">
                      📋 Подсказки (Cheat Sheet)
                    </Text>
                  </HStack>
                  <Box
                    bg="rgba(0,100,0,0.2)"
                    borderRadius="lg"
                    border="1px solid rgba(0,255,0,0.2)"
                    p={4}
                    color="gray.200"
                    maxH="400px"
                    overflowY="auto"
                  >
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <Text as="h1" fontSize="xl" fontWeight="bold" color="green.300" my={3} {...props} />,
                        h2: ({node, ...props}) => <Text as="h2" fontSize="lg" fontWeight="bold" color="green.300" my={2} {...props} />,
                        h3: ({node, ...props}) => <Text as="h3" fontSize="md" fontWeight="bold" color="green.300" my={1} {...props} />,
                        p: ({node, ...props}) => <Text as="p" my={1} fontSize="sm" {...props} />,
                        code: ({node, inline, ...props}: any) => 
                          inline ? 
                            <Text as="span" bg="rgba(0,255,0,0.2)" px={2} py={1} borderRadius="md" fontFamily="mono" fontSize="sm" {...props} /> :
                            <Box as="pre" bg="rgba(0,0,0,0.5)" p={3} borderRadius="md" my={2} overflowX="auto"><Text as="code" fontFamily="mono" fontSize="sm" {...props} /></Box>,
                        ul: ({node, ...props}) => <Box as="ul" pl={4} my={2} {...props} />,
                        ol: ({node, ...props}) => <Box as="ol" pl={4} my={2} {...props} />,
                        li: ({node, ...props}) => <Box as="li" my={1} {...props} />,
                      }}
                    >
                      {selectedTopic.cheatSheet}
                    </ReactMarkdown>
                  </Box>
                </Box>
              )}

              {/* Theory */}
              {selectedTopic.theory && (
                <Box>
                  <HStack spacing={2} mb={3}>
                    <Icon as={FiBook} w={5} h={5} color="purple.400" />
                    <Text color="white" fontWeight="bold" fontSize="lg">
                      📖 Теория
                    </Text>
                  </HStack>
                  <Box
                    bg="rgba(0,0,0,0.3)"
                    borderRadius="lg"
                    border="1px solid rgba(255,255,255,0.1)"
                    p={4}
                    color="gray.200"
                    maxH="500px"
                    overflowY="auto"
                  >
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
                        blockquote: ({node, ...props}) => <Box as="blockquote" borderLeft="4px solid" borderColor="purple.500" pl={4} my={2} fontStyle="italic" {...props} />,
                      }}
                    >
                      {selectedTopic.theory}
                    </ReactMarkdown>
                  </Box>
                </Box>
              )}

              {/* Code Examples */}
              {selectedTopic.codeExamples && selectedTopic.codeExamples.length > 0 && (
                <Box>
                  <HStack spacing={2} mb={3}>
                    <Icon as={FiCode} w={5} h={5} color="green.400" />
                    <Text color="white" fontWeight="bold" fontSize="lg">
                      💻 Примеры кода
                    </Text>
                  </HStack>
                  <Accordion allowMultiple defaultIndex={[0]}>
                    {selectedTopic.codeExamples.map((example, idx) => (
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
                            {example.title}
                          </Box>
                          <AccordionIcon color="gray.400" />
                        </AccordionButton>
                        <AccordionPanel pb={4} bg="rgba(0,0,0,0.2)">
                          <Editor
                            height="200px"
                            theme="vs-dark"
                            language="python"
                            value={example.code}
                            options={{
                              readOnly: true,
                              minimap: { enabled: false },
                              fontSize: 14,
                              scrollBeyondLastLine: false,
                            }}
                          />
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Box>
              )}

              {/* Tasks */}
              {selectedTopic.tasks && selectedTopic.tasks.length > 0 && (
                <Box>
                  <Text color="white" fontWeight="bold" fontSize="lg" mb={3}>
                    ✅ Задания ({selectedTopic.tasks.length})
                  </Text>
                  <VStack spacing={3} align="stretch">
                    {selectedTopic.tasks.map((task, idx) => (
                      <Box
                        key={idx}
                        bg="rgba(255,255,255,0.05)"
                        borderRadius="xl"
                        p={4}
                        border="1px solid rgba(255,255,255,0.1)"
                      >
                        <Text color="white" fontWeight="bold" mb={2}>
                          {task.title}
                        </Text>
                        <Text color="gray.400" fontSize="sm" mb={3}>
                          {task.description}
                        </Text>
                        <Box
                          bg="rgba(0,0,0,0.3)"
                          borderRadius="md"
                          p={3}
                          fontFamily="mono"
                          fontSize="sm"
                          color="gray.300"
                        >
                          <Text color="purple.400" fontWeight="bold" mb={2}>Ожидаемый вывод:</Text>
                          <Box as="pre" whiteSpace="pre-wrap">
                            {task.expectedOutput}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}
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
                <Text fontSize="sm" color="gray.600">
                  Или используйте поиск для быстрого нахождения темы
                </Text>
              </VStack>
            </Box>
          )}
        </Box>
      </HStack>
    </Box>
  );
}
