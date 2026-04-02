import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Input,
  Textarea,
  Select,
  useToast,
  Card,
  Badge,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { FiPlus, FiEdit, FiTrash, FiSave, FiX } from "react-icons/fi";
import { Editor } from "@monaco-editor/react";
import { Topic, getTopics, createTopic, updateTopic, deleteTopic, initializeDefaultTopics } from "../../services/topicsService";

interface TopicsManagementProps {
  onBack: () => void;
}

export default function TopicsManagement({ onBack }: TopicsManagementProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState<Omit<Topic, 'id'>>({
    category: "Основы",
    level: 1,
    title: "",
    description: "",
    cheatSheet: "",
    theory: "",
    materials: [],
    codeExamples: [],
    tasks: [],
  });
  
  // Materials state
  const [materials, setMaterials] = useState<{ type: 'video' | 'article' | 'link'; title: string; url: string; description: string }[]>([]);
  const [newMaterial, setNewMaterial] = useState({ type: 'video' as 'video' | 'article' | 'link', title: '', url: '', description: '' });

  useEffect(() => {
    loadTopics();
  }, []);

  async function loadTopics() {
    setLoading(true);
    try {
      // Initialize default topics if needed
      await initializeDefaultTopics();
      
      // Load all topics
      const allTopics = await getTopics();
      setTopics(allTopics);
    } catch (error) {
      console.error("Error loading topics:", error);
      toast({ title: "Ошибка загрузки тем", status: "error" });
    } finally {
      setLoading(false);
    }
  }

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setFormData({
      category: topic.category,
      level: topic.level,
      title: topic.title,
      description: topic.description,
      cheatSheet: topic.cheatSheet,
      theory: topic.theory,
      materials: topic.materials || [],
      codeExamples: topic.codeExamples,
      tasks: topic.tasks,
    });
    setMaterials((topic.materials || []).map((m: any) => ({ ...m, description: m.description || '' })));
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setSelectedTopic(null);
    setFormData({
      category: "Основы",
      level: 1,
      title: "",
      description: "",
      cheatSheet: "",
      theory: "",
      materials: [],
      codeExamples: [],
      tasks: [],
    });
    setMaterials([]);
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.theory) {
      toast({ title: "Заполните название и теорию", status: "warning" });
      return;
    }

    try {
      if (isCreating) {
        // Create new topic
        await createTopic({
          ...formData,
          materials: materials,
        });
        toast({ title: "Тема создана", status: "success" });
      } else if (selectedTopic) {
        // Update existing topic
        await updateTopic(selectedTopic.id, {
          ...formData,
          materials: materials,
        });
        toast({ title: "Тема обновлена", status: "success" });
      }

      await loadTopics();
      setIsEditing(false);
      setIsCreating(false);
      setSelectedTopic(null);
    } catch (error) {
      console.error("Error saving topic:", error);
      toast({ title: "Ошибка сохранения", status: "error" });
    }
  };

  const handleDelete = async () => {
    if (!selectedTopic) return;

    if (selectedTopic.isDefault) {
      toast({ title: "Нельзя удалить стандартную тему", status: "warning" });
      return;
    }

    if (!confirm(`Удалить тему "${selectedTopic.title}"?`)) return;

    try {
      await deleteTopic(selectedTopic.id);
      toast({ title: "Тема удалена", status: "success" });
      await loadTopics();
      setIsEditing(false);
      setSelectedTopic(null);
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast({ title: "Ошибка удаления", status: "error" });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedTopic(null);
  };

  const addCodeExample = () => {
    setFormData({
      ...formData,
      codeExamples: [...formData.codeExamples, { title: "Новый пример", code: "# Ваш код" }],
    });
  };

  const updateCodeExample = (index: number, field: 'title' | 'code', value: string) => {
    const updated = formData.codeExamples.map((ex: any, i: number) => 
      i === index ? { ...ex, [field]: value } : ex
    );
    setFormData({ ...formData, codeExamples: updated });
  };

  const removeCodeExample = (index: number) => {
    setFormData({
      ...formData,
      codeExamples: formData.codeExamples.filter((_: any, i: number) => i !== index),
    });
  };

  const addTask = () => {
    setFormData({
      ...formData,
      tasks: [...formData.tasks, { 
        title: "Новое задание", 
        description: "", 
        starterCode: "# Ваш код", 
        expectedOutput: "",
        solution: ""
      }],
    });
  };

  const updateTask = (index: number, field: keyof typeof formData.tasks[0], value: string) => {
    const updated = formData.tasks.map((task: any, i: number) => 
      i === index ? { ...task, [field]: value } : task
    );
    setFormData({ ...formData, tasks: updated });
  };

  const removeTask = (index: number) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.filter((_: any, i: number) => i !== index),
    });
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
            <Button onClick={onBack} bg="rgba(255,255,255,0.1)" color="white" _hover={{ bg: "rgba(255,255,255,0.2)" }} size="sm">
              ← Назад
            </Button>
            <Heading fontSize="2xl" color="white">Управление учебными материалами</Heading>
          </HStack>
          <HStack spacing={2}>
            <Badge colorScheme="blue" fontSize="md" px={4} py={2} borderRadius="full">
              {topics.length} тем
            </Badge>
            {!isEditing && !isCreating && (
              <Button
                leftIcon={<Icon as={FiPlus} />}
                bg="purple.600"
                color="white"
                _hover={{ bg: "purple.700" }}
                onClick={handleCreateNew}
              >
                Создать тему
              </Button>
            )}
          </HStack>
        </HStack>
      </Box>

      <HStack align="flex-start" p={6} spacing={6}>
        {/* Topics List */}
        <Box flex={1} maxW="400px">
          <VStack spacing={2} align="stretch" maxH="600px" overflowY="auto">
            {topics.map((topic) => (
              <Card
                key={topic.id}
                bg={selectedTopic?.id === topic.id ? "purple.900" : "rgba(255,255,255,0.05)"}
                borderRadius="xl"
                p={4}
                cursor="pointer"
                _hover={{ bg: "rgba(255,255,255,0.1)" }}
                onClick={() => handleSelectTopic(topic)}
              >
                <HStack justify="space-between" mb={2}>
                  <Text color="white" fontWeight="bold" fontSize="sm">{topic.title}</Text>
                  <HStack spacing={1}>
                    <Badge colorScheme="blue" fontSize="xs">{topic.category}</Badge>
                    <Badge colorScheme={topic.isDefault ? "gray" : "yellow"} fontSize="xs">
                      {topic.isDefault ? "Стандарт" : "Своя"}
                    </Badge>
                    <Badge colorScheme="yellow" fontSize="xs">Ур. {topic.level}</Badge>
                  </HStack>
                </HStack>
                <Text fontSize="xs" color="gray.400" noOfLines={2}>{topic.description}</Text>
              </Card>
            ))}
          </VStack>
        </Box>

        {/* Editor */}
        <Box flex={2}>
          {(isEditing || isCreating) ? (
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Heading fontSize="xl" color="white">
                  {isCreating ? "Создание темы" : "Редактирование темы"}
                </Heading>
                <HStack spacing={2}>
                  <Button
                    leftIcon={<Icon as={FiSave} />}
                    bg="green.600"
                    color="white"
                    _hover={{ bg: "green.700" }}
                    onClick={handleSave}
                  >
                    Сохранить
                  </Button>
                  <Button
                    leftIcon={<Icon as={FiX} />}
                    bg="gray.600"
                    color="white"
                    _hover={{ bg: "gray.700" }}
                    onClick={handleCancel}
                  >
                    Отмена
                  </Button>
                  {!isCreating && selectedTopic && !selectedTopic.isDefault && (
                    <IconButton
                      aria-label="Delete topic"
                      icon={<Icon as={FiTrash} />}
                      bg="red.600"
                      color="white"
                      _hover={{ bg: "red.700" }}
                      onClick={handleDelete}
                    />
                  )}
                </HStack>
              </HStack>

              {/* Basic Info */}
              <HStack spacing={4}>
                <Input
                  placeholder="Название темы"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  bg="rgba(255,255,255,0.05)"
                  border="1px solid rgba(255,255,255,0.1)"
                  color="white"
                />
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  bg="rgba(255,255,255,0.05)"
                  border="1px solid rgba(255,255,255,0.1)"
                  color="white"
                  w="200px"
                >
                  <option value="Основы">Основы</option>
                  <option value="ООП">ООП</option>
                  <option value="Продвинутый">Продвинутый</option>
                </Select>
                <Select
                  value={formData.level.toString()}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  bg="rgba(255,255,255,0.05)"
                  border="1px solid rgba(255,255,255,0.1)"
                  color="white"
                  w="150px"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => (
                    <option key={l} value={l}>Уровень {l}</option>
                  ))}
                </Select>
              </HStack>

              <Textarea
                placeholder="Описание"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                bg="rgba(255,255,255,0.05)"
                border="1px solid rgba(255,255,255,0.1)"
                color="white"
                rows={2}
              />

              {/* Cheat Sheet */}
              <Box>
                <Text color="white" fontWeight="bold" mb={2}>📋 Подсказки (Cheat Sheet):</Text>
                <Editor
                  height="200px"
                  theme="vs-dark"
                  language="markdown"
                  value={formData.cheatSheet}
                  onChange={(val) => setFormData({ ...formData, cheatSheet: val || "" })}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                  }}
                />
              </Box>

              {/* Theory */}
              <Box>
                <Text color="white" fontWeight="bold" mb={2}>📖 Теория (подробный текст):</Text>
                <Editor
                  height="300px"
                  theme="vs-dark"
                  language="markdown"
                  value={formData.theory}
                  onChange={(val) => setFormData({ ...formData, theory: val || "" })}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                  }}
                />
              </Box>

              {/* Materials */}
              <Box>
                <Text color="white" fontWeight="bold" mb={2}>🔗 Дополнительные материалы:</Text>
                <HStack spacing={2} mb={3}>
                  <Select
                    value={newMaterial.type}
                    onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value as any })}
                    bg="rgba(255,255,255,0.05)"
                    border="1px solid rgba(255,255,255,0.1)"
                    color="white"
                    w="150px"
                  >
                    <option value="video">Видео</option>
                    <option value="article">Статья</option>
                    <option value="link">Ссылка</option>
                  </Select>
                  <Input
                    placeholder="Название"
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                    bg="rgba(255,255,255,0.05)"
                    border="1px solid rgba(255,255,255,0.1)"
                    color="white"
                    flex={1}
                  />
                  <Input
                    placeholder="URL (https://...)"
                    value={newMaterial.url}
                    onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                    bg="rgba(255,255,255,0.05)"
                    border="1px solid rgba(255,255,255,0.1)"
                    color="white"
                    flex={2}
                  />
                  <Button onClick={() => {
                    if (newMaterial.title && newMaterial.url) {
                      setMaterials([...materials, { ...newMaterial }]);
                      setNewMaterial({ type: 'video', title: '', url: '', description: '' });
                    }
                  }} bg="green.600" color="white" _hover={{ bg: "green.700" }}>
                    Добавить
                  </Button>
                </HStack>
                {materials.length > 0 && (
                  <VStack spacing={2} align="stretch">
                    {materials.map((mat, idx) => (
                      <HStack key={idx} bg="rgba(255,255,255,0.05)" p={3} borderRadius="md">
                        <Badge colorScheme={mat.type === 'video' ? 'red' : mat.type === 'article' ? 'blue' : 'green'}>
                          {mat.type === 'video' ? '📹' : mat.type === 'article' ? '📄' : '🔗'} {mat.type}
                        </Badge>
                        <Text color="white" flex={1}>{mat.title}</Text>
                        <Text color="gray.400" fontSize="sm">{mat.url}</Text>
                        <Button size="sm" bg="red.600" color="white" _hover={{ bg: "red.700" }} onClick={() => setMaterials(materials.filter((_, i) => i !== idx))}>
                          ✕
                        </Button>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Box>

              {/* Code Examples */}
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text color="white" fontWeight="bold">Примеры кода:</Text>
                  <Button size="sm" onClick={addCodeExample} leftIcon={<Icon as={FiPlus} />}>
                    Добавить пример
                  </Button>
                </HStack>
                <Accordion allowMultiple defaultIndex={formData.codeExamples.map((_: any, i: number) => i)}>
                  {formData.codeExamples.map((example: any, idx: number) => (
                    <AccordionItem key={idx} border="1px solid rgba(255,255,255,0.1)" borderRadius="lg" mb={2}>
                      <AccordionButton bg="rgba(255,255,255,0.05)" _hover={{ bg: "rgba(255,255,255,0.1)" }}>
                        <Box flex="1" textAlign="left" color="white">{example.title}</Box>
                        <IconButton
                          size="sm"
                          aria-label="Remove example"
                          icon={<Icon as={FiTrash} />}
                          bg="red.600"
                          color="white"
                          _hover={{ bg: "red.700" }}
                          onClick={(e) => { e.stopPropagation(); removeCodeExample(idx); }}
                          mr={2}
                        />
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4} bg="rgba(0,0,0,0.2)">
                        <Input
                          placeholder="Название примера"
                          value={example.title}
                          onChange={(e) => updateCodeExample(idx, 'title', e.target.value)}
                          bg="rgba(255,255,255,0.05)"
                          border="1px solid rgba(255,255,255,0.1)"
                          color="white"
                          mb={2}
                        />
                        <Editor
                          height="150px"
                          theme="vs-dark"
                          language="python"
                          value={example.code}
                          onChange={(val) => updateCodeExample(idx, 'code', val || "")}
                          options={{
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

              {/* Tasks */}
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text color="white" fontWeight="bold">Задания:</Text>
                  <Button size="sm" onClick={addTask} leftIcon={<Icon as={FiPlus} />}>
                    Добавить задание
                  </Button>
                </HStack>
                <Accordion allowMultiple defaultIndex={formData.tasks.map((_: any, i: number) => i)}>
                  {formData.tasks.map((task: any, idx: number) => (
                    <AccordionItem key={idx} border="1px solid rgba(255,255,255,0.1)" borderRadius="lg" mb={2}>
                      <AccordionButton bg="rgba(255,255,255,0.05)" _hover={{ bg: "rgba(255,255,255,0.1)" }}>
                        <Box flex="1" textAlign="left" color="white">{task.title}</Box>
                        <IconButton
                          size="sm"
                          aria-label="Remove task"
                          icon={<Icon as={FiTrash} />}
                          bg="red.600"
                          color="white"
                          _hover={{ bg: "red.700" }}
                          onClick={(e) => { e.stopPropagation(); removeTask(idx); }}
                          mr={2}
                        />
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4} bg="rgba(0,0,0,0.2)">
                        <VStack spacing={2} align="stretch">
                          <Input
                            placeholder="Название задания"
                            value={task.title}
                            onChange={(e) => updateTask(idx, 'title', e.target.value)}
                            bg="rgba(255,255,255,0.05)"
                            border="1px solid rgba(255,255,255,0.1)"
                            color="white"
                          />
                          <Textarea
                            placeholder="Описание"
                            value={task.description}
                            onChange={(e) => updateTask(idx, 'description', e.target.value)}
                            bg="rgba(255,255,255,0.05)"
                            border="1px solid rgba(255,255,255,0.1)"
                            color="white"
                            rows={2}
                          />
                          <Editor
                            height="100px"
                            theme="vs-dark"
                            language="python"
                            value={task.starterCode}
                            onChange={(val) => updateTask(idx, 'starterCode', val || "")}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              scrollBeyondLastLine: false,
                            }}
                          />
                          <Textarea
                            placeholder="Ожидаемый вывод"
                            value={task.expectedOutput}
                            onChange={(e) => updateTask(idx, 'expectedOutput', e.target.value)}
                            bg="rgba(255,255,255,0.05)"
                            border="1px solid rgba(255,255,255,0.1)"
                            color="white"
                            rows={2}
                          />
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Box>
            </VStack>
          ) : (
            <Box h="full" display="flex" alignItems="center" justifyContent="center" color="gray.500">
              <VStack spacing={4}>
                <Icon as={FiEdit} w={16} h={16} />
                <Text>Выберите тему для редактирования или создайте новую</Text>
              </VStack>
            </Box>
          )}
        </Box>
      </HStack>
    </Box>
  );
}
