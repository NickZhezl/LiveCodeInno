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
  FormLabel,
} from "@chakra-ui/react";
import { FiPlus, FiUser, FiEye } from "react-icons/fi";
import { firestore } from "../../main";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";

interface HomeworkTask {
  id: string;
  title: string;
  category: string;
  level: number;
  description: string;
  task: string;
  starterCode: string;
  expectedOutput: string;
  testCode: string;
  materials?: {
    type: 'video' | 'article' | 'link';
    title: string;
    url: string;
    description?: string;
  }[];
  assignedTo?: string[];
}

interface HomeworkManagementProps {
  onBack: () => void;
  onOpenReviews?: () => void;
}

export default function HomeworkManagement({ onBack, onOpenReviews }: HomeworkManagementProps) {
  const [tasks, setTasks] = useState<HomeworkTask[]>([]);
  const [users, setUsers] = useState<{ uid: string; displayName: string; email: string }[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTask, setSelectedTask] = useState<HomeworkTask | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const { userData } = useAuth();
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "Основы",
    level: 1,
    description: "",
    task: "",
    starterCode: "",
    expectedOutput: "",
    testCode: "",
  });
  const [materials, setMaterials] = useState<{ type: 'video' | 'article' | 'link'; title: string; url: string; description: string }[]>([]);
  const [newMaterial, setNewMaterial] = useState({ type: 'video' as 'video' | 'article' | 'link', title: '', url: '', description: '' });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  async function fetchTasks() {
    try {
      const tasksRef = collection(firestore, "customHomework");
      const snapshot = await getDocs(tasksRef);
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as HomeworkTask[];
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  async function fetchUsers() {
    try {
      const usersRef = collection(firestore, "users");
      const snapshot = await getDocs(usersRef);
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as any[];
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  async function createTask() {
    if (!formData.title || !formData.task) {
      toast({ title: "Заполните обязательные поля", status: "warning" });
      return;
    }

    try {
      await addDoc(collection(firestore, "customHomework"), {
        ...formData,
        materials: materials,
        assignedTo: selectedUsers,
        createdAt: new Date(),
        createdBy: userData?.uid,
      });
      
      toast({ title: "Задание создано", status: "success" });
      setIsCreating(false);
      fetchTasks();
      resetForm();
    } catch (error) {
      console.error("Error creating task:", error);
      toast({ title: "Ошибка создания", status: "error" });
    }
  }

  async function assignTask(taskId: string) {
    try {
      const taskRef = doc(firestore, "customHomework", taskId);
      await updateDoc(taskRef, {
        assignedTo: selectedUsers,
      });
      
      // Notify users (create assignment record)
      for (const userId of selectedUsers) {
        await addDoc(collection(firestore, "assignments"), {
          taskId,
          userId,
          assignedAt: new Date(),
          status: "pending",
        });
      }
      
      toast({ title: "Задание назначено", status: "success" });
      setSelectedTask(null);
      setSelectedUsers([]);
      fetchTasks();
    } catch (error) {
      console.error("Error assigning task:", error);
      toast({ title: "Ошибка назначения", status: "error" });
    }
  }

  async function deleteTask(taskId: string) {
    if (!confirm("Удалить это задание?")) return;
    
    try {
      await deleteDoc(doc(firestore, "customHomework", taskId));
      toast({ title: "Задание удалено", status: "success" });
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({ title: "Ошибка удаления", status: "error" });
    }
  }

  function resetForm() {
    setFormData({
      title: "",
      category: "Основы",
      level: 1,
      description: "",
      task: "",
      starterCode: "",
      expectedOutput: "",
      testCode: "",
    });
    setMaterials([]);
    setNewMaterial({ type: 'video', title: '', url: '', description: '' });
    setSelectedUsers([]);
  }

  function addMaterial() {
    if (!newMaterial.title || !newMaterial.url) {
      toast({ title: "Заполните название и ссылку", status: "warning" });
      return;
    }
    setMaterials([...materials, { ...newMaterial }]);
    setNewMaterial({ type: 'video', title: '', url: '', description: '' });
  }

  function removeMaterial(index: number) {
    setMaterials(materials.filter((_, i) => i !== index));
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
            <Heading fontSize="2xl" color="white">Управление ДЗ</Heading>
          </HStack>
        </HStack>
      </Box>

      <Box p={6}>
        <HStack justify="space-between" mb={6}>
          <Heading fontSize="xl" color="white">Домашние задания</Heading>
          <HStack spacing={2}>
            {onOpenReviews && (
              <Button
                leftIcon={<Icon as={FiEye} />}
                bg="blue.600"
                color="white"
                _hover={{ bg: "blue.700" }}
                onClick={onOpenReviews}
              >
                Проверка работ
              </Button>
            )}
            <Button
              leftIcon={<Icon as={FiPlus} />}
              bg="purple.600"
              color="white"
              _hover={{ bg: "purple.700" }}
              onClick={() => setIsCreating(!isCreating)}
            >
              {isCreating ? "Отмена" : "Создать ДЗ"}
            </Button>
          </HStack>
        </HStack>

        {/* Create Task Form */}
        {isCreating && (
          <Card bg="rgba(255,255,255,0.05)" borderRadius="xl" mb={6} p={6}>
            <Heading fontSize="lg" color="white" mb={4}>Создание задания</Heading>
            <VStack spacing={4} align="stretch">
              <Input
                placeholder="Название"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                bg="rgba(255,255,255,0.05)"
                border="1px solid rgba(255,255,255,0.1)"
                color="white"
              />
              
              <HStack>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  bg="rgba(255,255,255,0.05)"
                  border="1px solid rgba(255,255,255,0.1)"
                  color="white"
                  w="200px"
                >
                  <option value="Основы">Основы</option>
                  <option value="Средний уровень">Средний уровень</option>
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
                  <option value="1">Уровень 1</option>
                  <option value="2">Уровень 2</option>
                  <option value="3">Уровень 3</option>
                  <option value="4">Уровень 4</option>
                  <option value="5">Уровень 5</option>
                  <option value="6">Уровень 6</option>
                  <option value="7">Уровень 7</option>
                  <option value="8">Уровень 8</option>
                  <option value="9">Уровень 9</option>
                </Select>
              </HStack>

              <Textarea
                placeholder="Описание"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                bg="rgba(255,255,255,0.05)"
                border="1px solid rgba(255,255,255,0.1)"
                color="white"
                rows={3}
              />

              <Textarea
                placeholder="Задание (по шагам)"
                value={formData.task}
                onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                bg="rgba(255,255,255,0.05)"
                border="1px solid rgba(255,255,255,0.1)"
                color="white"
                rows={4}
              />

              <Textarea
                placeholder="Стартовый код"
                value={formData.starterCode}
                onChange={(e) => setFormData({ ...formData, starterCode: e.target.value })}
                bg="rgba(255,255,255,0.05)"
                border="1px solid rgba(255,255,255,0.1)"
                color="white"
                fontFamily="mono"
                rows={6}
              />

              <Textarea
                placeholder="Тестовый код (должен выводить TESTS_PASSED при успехе)"
                value={formData.testCode}
                onChange={(e) => setFormData({ ...formData, testCode: e.target.value })}
                bg="rgba(255,255,255,0.05)"
                border="1px solid rgba(255,255,255,0.1)"
                color="white"
                fontFamily="mono"
                rows={6}
              />

              <Textarea
                placeholder="Ожидаемый вывод"
                value={formData.expectedOutput}
                onChange={(e) => setFormData({ ...formData, expectedOutput: e.target.value })}
                bg="rgba(255,255,255,0.05)"
                border="1px solid rgba(255,255,255,0.1)"
                color="white"
                fontFamily="mono"
                rows={4}
              />

              {/* Materials Section */}
              <Box>
                <FormLabel color="gray.400" mb={2}>Дополнительные материалы:</FormLabel>
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
                  <Button onClick={addMaterial} bg="green.600" color="white" _hover={{ bg: "green.700" }}>
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
                        <Button size="sm" bg="red.600" color="white" _hover={{ bg: "red.700" }} onClick={() => removeMaterial(idx)}>
                          ✕
                        </Button>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Box>

              <Box>
                <FormLabel color="gray.400" mb={2}>Назначить пользователям:</FormLabel>
                <HStack spacing={2} flexWrap="wrap">
                  {users.map(user => (
                    <Badge
                      key={user.uid}
                      px={3}
                      py={2}
                      borderRadius="full"
                      bg={selectedUsers.includes(user.uid) ? "purple.600" : "rgba(255,255,255,0.1)"}
                      color="white"
                      cursor="pointer"
                      onClick={() => {
                        setSelectedUsers(prev =>
                          prev.includes(user.uid)
                            ? prev.filter(id => id !== user.uid)
                            : [...prev, user.uid]
                        );
                      }}
                    >
                      {user.displayName}
                    </Badge>
                  ))}
                </HStack>
              </Box>

              <Button
                bg="green.600"
                color="white"
                _hover={{ bg: "green.700" }}
                onClick={createTask}
              >
                Создать задание
              </Button>
            </VStack>
          </Card>
        )}

        {/* Tasks List */}
        <VStack spacing={4} align="stretch">
          {tasks.map(task => (
            <Card key={task.id} bg="rgba(255,255,255,0.05)" borderRadius="xl" p={4}>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <HStack spacing={2}>
                    <Text color="white" fontWeight="bold">{task.title}</Text>
                    <Badge colorScheme="purple">{task.category}</Badge>
                    <Badge colorScheme="yellow">Уровень {task.level}</Badge>
                  </HStack>
                  <Text color="gray.400" fontSize="sm">{task.description}</Text>
                  {task.assignedTo && task.assignedTo.length > 0 && (
                    <Text color="gray.500" fontSize="xs">
                      Назначено: {task.assignedTo.length} пользователям
                    </Text>
                  )}
                </VStack>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    leftIcon={<Icon as={FiUser} />}
                    bg="purple.600"
                    color="white"
                    _hover={{ bg: "purple.700" }}
                    onClick={() => {
                      setSelectedTask(task);
                      setSelectedUsers(task.assignedTo || []);
                    }}
                  >
                    Назначить
                  </Button>
                  <Button
                    size="sm"
                    bg="red.600"
                    color="white"
                    _hover={{ bg: "red.700" }}
                    onClick={() => deleteTask(task.id)}
                  >
                    Удалить
                  </Button>
                </HStack>
              </HStack>
            </Card>
          ))}
        </VStack>

        {/* Assign Modal */}
        {selectedTask && (
          <Card bg="rgba(255,255,255,0.05)" borderRadius="xl" p={6} mt={6}>
            <Heading fontSize="lg" color="white" mb={4}>
              Назначить: {selectedTask.title}
            </Heading>
            <HStack spacing={2} flexWrap="wrap" mb={4}>
              {users.map(user => (
                <Badge
                  key={user.uid}
                  px={3}
                  py={2}
                  borderRadius="full"
                  bg={selectedUsers.includes(user.uid) ? "purple.600" : "rgba(255,255,255,0.1)"}
                  color="white"
                  cursor="pointer"
                  onClick={() => {
                    setSelectedUsers(prev =>
                      prev.includes(user.uid)
                        ? prev.filter(id => id !== user.uid)
                        : [...prev, user.uid]
                    );
                  }}
                >
                  {user.displayName}
                </Badge>
              ))}
            </HStack>
            <Button
              bg="green.600"
              color="white"
              _hover={{ bg: "green.700" }}
              onClick={() => assignTask(selectedTask.id)}
            >
              Назначить {selectedUsers.length} пользователям
            </Button>
            <Button
              ml={4}
              bg="rgba(255,255,255,0.1)"
              color="white"
              _hover={{ bg: "rgba(255,255,255,0.2)" }}
              onClick={() => {
                setSelectedTask(null);
                setSelectedUsers([]);
              }}
            >
              Отмена
            </Button>
          </Card>
        )}
      </Box>
    </Box>
  );
}
