import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  useToast,
  Icon,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Tag,
  TagLabel,
  TagCloseButton,
  Card,
  CardBody,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import { FiSearch, FiPlus, FiCopy, FiHeart, FiTag } from "react-icons/fi";
import { Editor } from "@monaco-editor/react";
import { useAuth } from "../contexts/AuthContext";
import { firestore } from "../main";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";

interface SnippetLibraryProps {
  onBack: () => void;
}

interface Snippet {
  id: string;
  userId: string;
  userName: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
  description: string;
  isPublic: boolean;
  likes: string[];
  createdAt: any;
}

export default function SnippetLibrary({ onBack }: SnippetLibraryProps) {
  const { userData } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<Snippet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // New snippet form
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newLanguage, setNewLanguage] = useState("python");
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(true);

  useEffect(() => {
    loadSnippets();
  }, []);

  useEffect(() => {
    filterSnippets();
  }, [snippets, searchQuery, selectedLanguage]);

  const loadSnippets = async () => {
    if (!userData) return;
    setIsLoading(true);

    try {
      const snippetsRef = collection(firestore, "snippets");
      const q = query(snippetsRef, where("isPublic", "==", true), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const loadedSnippets = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Snippet[];
      setSnippets(loadedSnippets);
    } catch (error) {
      console.error("Error loading snippets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSnippets = () => {
    let filtered = snippets;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    if (selectedLanguage !== "all") {
      filtered = filtered.filter((s) => s.language === selectedLanguage);
    }

    setFilteredSnippets(filtered);
  };

  const addTag = () => {
    if (newTag.trim() && !newTags.includes(newTag.trim())) {
      setNewTags([...newTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setNewTags(newTags.filter((t) => t !== tag));
  };

  const saveSnippet = async () => {
    if (!userData || !newTitle || !newCode) {
      toast({ title: "Заполните название и код", status: "warning" });
      return;
    }

    try {
      await addDoc(collection(firestore, "snippets"), {
        userId: userData.uid,
        userName: userData.displayName,
        title: newTitle,
        code: newCode,
        language: newLanguage,
        tags: newTags,
        description: newDescription,
        isPublic: newIsPublic,
        likes: [],
        createdAt: serverTimestamp(),
      });

      toast({ title: "Сниппет сохранен!", status: "success" });
      onClose();
      loadSnippets();
      resetForm();
    } catch (error) {
      console.error("Error saving snippet:", error);
      toast({ title: "Ошибка сохранения", status: "error" });
    }
  };

  const resetForm = () => {
    setNewTitle("");
    setNewCode("");
    setNewLanguage("python");
    setNewTags([]);
    setNewTag("");
    setNewDescription("");
    setNewIsPublic(true);
  };

  const likeSnippet = async (snippetId: string) => {
    if (!userData) return;

    try {
      const snippetRef = doc(firestore, "snippets", snippetId);
      const snippet = snippets.find((s) => s.id === snippetId);

      if (snippet?.likes.includes(userData.uid)) {
        await updateDoc(snippetRef, { likes: arrayRemove(userData.uid) });
      } else {
        await updateDoc(snippetRef, { likes: arrayUnion(userData.uid) });
      }

      loadSnippets();
    } catch (error) {
      console.error("Error liking snippet:", error);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Код скопирован!", status: "success" });
  };

  const languages = ["all", "python", "javascript", "sql", "cpp", "java"];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={20}>
        <Spinner size="xl" color="purple.500" />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <HStack justify="space-between" mb={6}>
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
            📚 Библиотека сниппетов
          </Heading>
        </HStack>
        <Button
          bg="purple.600"
          color="white"
          _hover={{ bg: "purple.700" }}
          leftIcon={<Icon as={FiPlus} />}
          onClick={onOpen}
        >
          Добавить сниппет
        </Button>
      </HStack>

      {/* Filters */}
      <HStack spacing={4} mb={6}>
        <InputGroup flex={1}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Поиск сниппетов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="rgba(255,255,255,0.05)"
            color="white"
            borderColor="gray.600"
            _focus={{ borderColor: "purple.500" }}
            pl={10}
          />
        </InputGroup>
        <Select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          bg="rgba(255,255,255,0.05)"
          color="white"
          borderColor="gray.600"
          maxW="200px"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang} style={{ backgroundColor: "#2D3748", color: "white" }}>
              {lang === "all" ? "Все языки" : lang.toUpperCase()}
            </option>
          ))}
        </Select>
      </HStack>

      {/* Snippets Grid */}
      {filteredSnippets.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {filteredSnippets.map((snippet) => (
            <Card
              key={snippet.id}
              bg="rgba(255,255,255,0.05)"
              borderRadius="xl"
              _hover={{ bg: "rgba(255,255,255,0.08)" }}
            >
              <CardBody>
                <VStack align="start" spacing={3}>
                  <HStack justify="space-between" w="full">
                    <Text color="white" fontWeight="bold" fontSize="lg">
                      {snippet.title}
                    </Text>
                    <Badge colorScheme="blue" fontSize="xs">
                      {snippet.language.toUpperCase()}
                    </Badge>
                  </HStack>

                  {snippet.description && (
                    <Text color="gray.400" fontSize="sm" noOfLines={2}>
                      {snippet.description}
                    </Text>
                  )}

                  <Box
                    bg="rgba(0,0,0,0.3)"
                    borderRadius="md"
                    p={3}
                    w="full"
                    maxH="150px"
                    overflow="hidden"
                  >
                    <Text
                      fontFamily="mono"
                      fontSize="xs"
                      color="gray.300"
                      whiteSpace="pre-wrap"
                      noOfLines={6}
                    >
                      {snippet.code}
                    </Text>
                  </Box>

                  {snippet.tags.length > 0 && (
                    <HStack spacing={1} flexWrap="wrap">
                      {snippet.tags.map((tag) => (
                        <Tag key={tag} size="sm" colorScheme="purple">
                          <Icon as={FiTag} w={2} h={2} mr={1} />
                          <TagLabel>{tag}</TagLabel>
                        </Tag>
                      ))}
                    </HStack>
                  )}

                  <HStack justify="space-between" w="full">
                    <HStack spacing={2}>
                      <Button
                        size="xs"
                        bg="rgba(255,255,255,0.1)"
                        color="white"
                        _hover={{ bg: "rgba(255,255,255,0.2)" }}
                        leftIcon={<Icon as={FiCopy} />}
                        onClick={() => copyToClipboard(snippet.code)}
                      >
                        Копировать
                      </Button>
                      <Button
                        size="xs"
                        bg={snippet.likes.includes(userData?.uid || "") ? "red.600" : "rgba(255,255,255,0.1)"}
                        color="white"
                        _hover={{ bg: snippet.likes.includes(userData?.uid || "") ? "red.700" : "rgba(255,255,255,0.2)" }}
                        leftIcon={<Icon as={FiHeart} />}
                        onClick={() => likeSnippet(snippet.id)}
                      >
                        {snippet.likes.length}
                      </Button>
                    </HStack>
                    <Text color="gray.500" fontSize="xs">
                      {snippet.userName}
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Box bg="rgba(255,255,255,0.05)" borderRadius="xl" p={10} textAlign="center">
          <Icon as={FiTag} w={16} h={16} color="gray.600" mb={4} />
          <Text color="gray.400" fontSize="lg">
            {searchQuery ? "Сниппеты не найдены" : "Пока нет сниппетов"}
          </Text>
          <Text color="gray.500" fontSize="sm" mt={2}>
            {searchQuery ? "Попробуйте изменить запрос" : "Будьте первым - добавьте свой сниппет!"}
          </Text>
        </Box>
      )}

      {/* Add Snippet Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader color="white">Добавить сниппет</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input
                placeholder="Название сниппета"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                bg="rgba(255,255,255,0.1)"
                color="white"
                borderColor="gray.600"
              />

              <Textarea
                placeholder="Описание (необязательно)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                bg="rgba(255,255,255,0.1)"
                color="white"
                borderColor="gray.600"
                rows={2}
              />

              <HStack w="full">
                <Select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  bg="rgba(255,255,255,0.1)"
                  color="white"
                  borderColor="gray.600"
                >
                  <option value="python" style={{ backgroundColor: "#2D3748", color: "white" }}>Python</option>
                  <option value="javascript" style={{ backgroundColor: "#2D3748", color: "white" }}>JavaScript</option>
                  <option value="sql" style={{ backgroundColor: "#2D3748", color: "white" }}>SQL</option>
                  <option value="cpp" style={{ backgroundColor: "#2D3748", color: "white" }}>C++</option>
                  <option value="java" style={{ backgroundColor: "#2D3748", color: "white" }}>Java</option>
                </Select>
              </HStack>

              <Box w="full">
                <Text color="gray.300" mb={2} fontSize="sm">Код:</Text>
                <Editor
                  height="200px"
                  theme="vs-dark"
                  language={newLanguage}
                  value={newCode}
                  onChange={(val) => setNewCode(val || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                  }}
                />
              </Box>

              <Box w="full">
                <Text color="gray.300" mb={2} fontSize="sm">Теги:</Text>
                <HStack>
                  <Input
                    placeholder="Добавить тег"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    borderColor="gray.600"
                    size="sm"
                  />
                  <Button size="sm" bg="purple.600" color="white" _hover={{ bg: "purple.700" }} onClick={addTag}>
                    <Icon as={FiPlus} />
                  </Button>
                </HStack>
                <HStack mt={2} spacing={1} flexWrap="wrap">
                  {newTags.map((tag) => (
                    <Tag key={tag} size="md" colorScheme="purple">
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton onClick={() => removeTag(tag)} />
                    </Tag>
                  ))}
                </HStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" color="gray.400" mr={3} onClick={onClose}>
              Отмена
            </Button>
            <Button bg="purple.600" color="white" _hover={{ bg: "purple.700" }} onClick={saveSnippet}>
              Сохранить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
