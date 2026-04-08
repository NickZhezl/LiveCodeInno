import { useState, useRef, useEffect } from "react";
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
  IconButton,
  Tooltip,
  Avatar,
  AvatarGroup,
} from "@chakra-ui/react";
import { FiPlay, FiTrash, FiUsers, FiCopy, FiExternalLink } from "react-icons/fi";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { firestore } from "../main";
import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  serverTimestamp,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { executePythonLocal } from "../utils/localExecutor";

interface LiveCodingProps {
  onBack: () => void;
  initialRoomId?: string;
}

export default function LiveCoding({ onBack, initialRoomId }: LiveCodingProps) {
  const { userData, isAdmin } = useAuth();
  const [code, setCode] = useState<string>(`# Live Coding - Python Песочница
# Пишите любой код здесь и нажимайте "Выполнить"

# Пример 1: Переменные
name = "Python Developer"
age = 25
skills = ["Python", "JavaScript", "SQL"]

print(f"Привет, {name}!")
print(f"Возраст: {age}")
print(f"Навыки: {skills}")

# Пример 2: Функции
def greet(person):
    return f"Hello, {person}!"

print(greet("World"))

# Пример 3: Списки
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]
print(f"Квадраты: {squares}")
`);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [lastExecutedBy, setLastExecutedBy] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [roomId, setRoomId] = useState<string>(initialRoomId || "");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [participants, setParticipants] = useState<Map<string, any>>(new Map());
  
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const toast = useToast();
  const decorationIds = useRef<string[]>([]);
  const isRemoteUpdate = useRef(false); // Track if update is from Firestore

  // Handle initialRoomId changes (from URL)
  useEffect(() => {
    if (initialRoomId && initialRoomId !== roomId && userData) {
      setRoomId(initialRoomId);
      // Create room in Firestore if it doesn't exist
      const roomRef = doc(firestore, "rooms", initialRoomId);
      getDoc(roomRef).then((docSnap) => {
        if (!docSnap.exists()) {
          setDoc(roomRef, {
            code: code,
            language: "python",
            createdAt: serverTimestamp(),
            createdBy: userData.displayName || "Anonymous",
          }, { merge: true });
        }
      });
    }
  }, [initialRoomId, userData]);

  // Generate color from string
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
  };

  // Execute code
  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    setError("");

    try {
      const result = await executePythonLocal(code);

      // Save result to Firestore for sync
      const roomRef = doc(firestore, "rooms", roomId);
      const execResult = {
        output: result.stdout || "",
        error: result.stderr || "",
        executedBy: userData?.displayName || "Anonymous",
        executedAt: serverTimestamp(),
        code: code,
      };
      await setDoc(roomRef, { lastExecution: execResult }, { merge: true });

      // Update local state
      setLastExecutedBy(userData?.displayName || "Anonymous");
      if (result.stderr) {
        setError(result.stderr);
        setOutput("");
        toast({ title: "Ошибка выполнения", status: "error", duration: 5000 });
      } else {
        setOutput(result.stdout || "Код выполнен успешно (нет вывода)");
        setError("");
        toast({ title: "Код выполнен!", status: "success" });
      }
    } catch (e: any) {
      const errorMsg = e.message || "Неизвестная ошибка";
      setError(errorMsg);
      setOutput("");
      setLastExecutedBy(userData?.displayName || "Anonymous");
      
      // Save error to Firestore
      const roomRef = doc(firestore, "rooms", roomId);
      await setDoc(roomRef, {
        lastExecution: {
          output: "",
          error: errorMsg,
          executedBy: userData?.displayName || "Anonymous",
          executedAt: serverTimestamp(),
          code: code,
        },
      }, { merge: true });
      
      toast({ title: "Ошибка", status: "error" });
    } finally {
      setIsRunning(false);
    }
  };

  // Clear code
  const clearCode = () => {
    setCode("");
    setOutput("");
    setError("");
    toast({ title: "Редактор очищен", status: "info" });
  };

  // Create new room
  const createRoom = async () => {
    if (!userData) {
      toast({ title: "Необходимо войти в систему", status: "warning" });
      return;
    }

    setIsCreatingRoom(true);
    try {
      const newRoomRef = await addDoc(collection(firestore, "rooms"), {
        code: code,
        language: "python",
        createdAt: serverTimestamp(),
        createdBy: userData.uid,
        creatorName: userData.displayName,
        participants: [userData.uid],
        isActive: true,
      });

      setRoomId(newRoomRef.id);
      toast({ title: `Комната создана: ${newRoomRef.id}`, status: "success" });
    } catch (error) {
      console.error("Error creating room:", error);
      toast({ title: "Ошибка создания комнаты", status: "error" });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // Join existing room
  const joinRoom = async () => {
    if (!userData || !joinRoomId) {
      toast({ title: "Введите ID комнаты", status: "warning" });
      return;
    }

    setIsJoiningRoom(true);
    try {
      const roomRef = doc(firestore, "rooms", joinRoomId);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        toast({ title: "Комната не найдена", status: "error" });
        setIsJoiningRoom(false);
        return;
      }

      setRoomId(joinRoomId);
      toast({ title: `Присоединились к комнате: ${joinRoomId}`, status: "success" });
    } catch (error) {
      console.error("Error joining room:", error);
      toast({ title: "Ошибка присоединения", status: "error" });
    } finally {
      setIsJoiningRoom(false);
    }
  };

  // Leave room
  const leaveRoom = () => {
    setRoomId("");
    setParticipants(new Map());
    decorationIds.current = [];
    toast({ title: "Вы покинули комнату", status: "info" });
  };

  // Copy room link
  const copyRoomLink = async () => {
    if (!roomId) return;
    const link = `${window.location.origin}/?roomId=${roomId}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: "Ссылка скопирована", status: "success" });
    } catch (error) {
      toast({ title: "Ошибка копирования", status: "error" });
    }
  };

  // Load example code
  const loadExample = (example: string) => {
    const examples: Record<string, string> = {
      basic: `# Основы Python
# Переменные и типы данных

# Переменные
age = 25
name = "Alice"

# Типы данных
string_var = "Hello"
number = 42
boolean = True
null_value = None
array = [1, 2, 3]
object_var = {"key": "value"}

print("=== Типы данных ===")
print(f"String: {type(string_var).__name__} = {string_var}")
print(f"Number: {type(number).__name__} = {number}")
print(f"Boolean: {type(boolean).__name__} = {boolean}")
print(f"Array: {type(array).__name__} = {array}")
print(f"Object: {type(object_var).__name__} = {object_var}")
`,
      functions: `# Функции Python

# Простая функция
def greet(name):
    return f"Hello, {name}!"

# Функция с параметром по умолчанию
def greet_default(name="Guest"):
    return f"Hello, {name}!"

# Функция с произвольным числом аргументов
def sum_all(*numbers):
    return sum(numbers)

# Лямбда-функция
square = lambda x: x ** 2

print(greet("Alice"))
print(greet_default())
print(f"Sum: {sum_all(1, 2, 3, 4, 5)}")
print(f"5^2 = {square(5)}")
`,
      arrays: `# Списки и методы

numbers = [1, 2, 3, 4, 5]
fruits = ["apple", "banana", "cherry"]

print("=== Базовые операции ===")
print(f"Длина: {len(numbers)}")
print(f"Первый: {numbers[0]}")
print(f"Последний: {numbers[-1]}")

print("\\n=== Методы списков ===")
print(f"map: {[x * 2 for x in numbers]}")
print(f"filter: {[x for x in numbers if x > 2]}")
print(f"reduce: {sum(numbers)}")
print(f"find: {next((x for x in numbers if x > 3), None)}")

print("\\n=== Цепочки методов ===")
result = sum(x ** 2 for x in numbers if x % 2 == 1)
print(f"Сумма квадратов нечетных: {result}")
`,
      async: `# Асинхронность Python
import asyncio

async def fetchData():
    print("Начало загрузки...")
    await asyncio.sleep(0.5)
    print("Данные получены: {'id': 1, 'name': 'Data'}")
    return {'id': 1, 'name': 'Data'}

async def fetch_multiple():
    results = await asyncio.gather(
        asyncio.create_task(asyncio.sleep(0.1, result="Data 1")),
        asyncio.create_task(asyncio.sleep(0.1, result="Data 2"))
    )
    print(f"Multiple: {results}")

print("Запуск асинхронных операций...")
# asyncio.run(fetch_data())  # Раскомментируйте для запуска
`,
      oop: `# Классы и ООП

class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def greet(self):
        return f"Hello, I'm {self.name}"

    @staticmethod
    def species():
        return "Homo Sapiens"

class Student(Person):
    def __init__(self, name, age, grade):
        super().__init__(name, age)
        self.grade = grade

    def study(self):
        return f"{self.name} изучает Python"

    def greet(self):
        return f"{super().greet()}, a student"

alice = Person("Alice", 25)
bob = Student("Bob", 20, "A")

print(alice.greet())
print(bob.greet())
print(bob.study())
print(f"Species: {Person.species()}")
`,
    };

    setCode(examples[example] || "");
    toast({ title: `Пример "${example}" загружен`, status: "info" });
  };

  // Sync code with Firestore
  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(firestore, "rooms", roomId);

    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        if (data.code !== undefined && editorRef.current) {
          const currentValue = editorRef.current.getValue();
          if (currentValue !== data.code) {
            // Mark as remote update to prevent sync loop
            isRemoteUpdate.current = true;
            editorRef.current.setValue(data.code);
            setCode(data.code);
            // Reset flag after a short delay
            setTimeout(() => {
              isRemoteUpdate.current = false;
            }, 100);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  // Sync execution results with Firestore
  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(firestore, "rooms", roomId);

    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Check if there's a new execution result
        if (data.lastExecution && data.lastExecution.executedAt) {
          const execData = data.lastExecution;
          
          // Only update if this execution is from another user or different code
          const isFromOtherUser = execData.executedBy !== userData?.displayName;
          const isDifferentCode = execData.code !== code;
          
          if (isFromOtherUser || isDifferentCode) {
            setLastExecutedBy(execData.executedBy || "Unknown");
            if (execData.error) {
              setError(execData.error);
              setOutput("");
            } else if (execData.output) {
              setOutput(execData.output);
              setError("");
            }
          }
        }
      }
    });

    return () => unsubscribe();
  }, [roomId, userData, code]);

  // Sync cursors and participants
  useEffect(() => {
    if (!roomId || !userData) return;

    // Subscribe to cursors
    const cursorsCollection = collection(firestore, `rooms/${roomId}/cursors`);
    const unsubscribe = onSnapshot(cursorsCollection, (snapshot) => {
      if (!editorRef.current || !monaco) return;

      const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];
      const cssRules: string[] = [];
      const newParticipants = new Map<string, any>();

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.userName === userData.displayName) return;

        newParticipants.set(docSnap.id, data);

        const safeUserName = data.userName.replace(/[^a-zA-Z0-9]/g, "");
        const cursorClass = `remote-cursor-${safeUserName}`;

        cssRules.push(`
          .${cursorClass} { 
            position: absolute; 
            border-left: 2px solid ${data.color}; 
            height: 20px !important; 
            display: block; 
            z-index: 100; 
            pointer-events: none; 
          }
          .${cursorClass}::after { 
            content: "${data.userName}"; 
            position: absolute; 
            top: -18px; 
            left: 0; 
            background: ${data.color}; 
            color: #fff; 
            font-size: 10px; 
            padding: 2px 4px; 
            border-radius: 3px; 
            white-space: nowrap; 
          }
        `);

        newDecorations.push({
          range: new monaco.Range(
            data.lineNumber,
            data.column,
            data.lineNumber,
            data.column
          ),
          options: {
            className: cursorClass,
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            isWholeLine: false,
          },
        });
      });

      setParticipants(newParticipants);

      let styleElement = document.getElementById(`cursors-styles-${roomId}`);
      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = `cursors-styles-${roomId}`;
        document.head.appendChild(styleElement);
      }
      styleElement.innerHTML = cssRules.join("\n");

      decorationIds.current = editorRef.current.deltaDecorations(
        decorationIds.current,
        newDecorations
      );
    });

    // Update own cursor
    const updateCursor = (position: monaco.Position) => {
      const cursorRef = doc(
        firestore,
        `rooms/${roomId}/cursors/${userData.displayName}`
      );
      setDoc(
        cursorRef,
        {
          userName: userData.displayName,
          color: stringToColor(userData.displayName),
          lineNumber: position.lineNumber,
          column: position.column,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ).catch(console.error);
    };

    const editor = editorRef.current;
    if (editor) {
      editor.onDidChangeCursorPosition((e) => {
        updateCursor(e.position);
      });
    }

    return () => {
      unsubscribe();
      // Clean up cursor on leave
      if (roomId && userData) {
        const cursorRef = doc(
          firestore,
          `rooms/${roomId}/cursors/${userData.displayName}`
        );
        setDoc(cursorRef, {
          userName: userData.displayName,
          lineNumber: 0,
          column: 0,
          leftAt: serverTimestamp(),
        }).catch(console.error);
      }
    };
  }, [roomId, userData]);

  // Save code to Firestore on change
  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue === undefined || !roomId) return;
    
    // Don't save if this is a remote update (prevents sync loop)
    if (isRemoteUpdate.current) return;
    
    setCode(newValue);
    const roomRef = doc(firestore, "rooms", roomId);
    setDoc(roomRef, { code: newValue }, { merge: true }).catch(console.error);
  };

  // Editor mount
  const onMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: typeof monaco
  ) => {
    editorRef.current = editor;

    // Python autocompletion
    monacoInstance.languages.registerCompletionItemProvider("python", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        return {
          suggestions: [
            {
              label: "print",
              kind: monacoInstance.languages.CompletionItemKind.Function,
              insertText: "print(${1:value})",
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: "def",
              kind: monacoInstance.languages.CompletionItemKind.Keyword,
              insertText: "def ${1:func_name}(${2:args}):\n\t${3:pass}",
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: "class",
              kind: monacoInstance.languages.CompletionItemKind.Keyword,
              insertText: "class ${1:ClassName}:\n\tdef __init__(self, ${2:args}):\n\t\t${3:pass}",
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: "for loop",
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: "for ${1:item} in ${2:iterable}:\n\t${3:pass}",
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: "if",
              kind: monacoInstance.languages.CompletionItemKind.Keyword,
              insertText: "if ${1:condition}:\n\t${2:pass}",
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: "async/await",
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText:
                "async def ${1:func_name}():\n\ttry:\n\t\t${2:await something}\n\texcept Exception as e:\n\t\t${3:print(e)}",
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
          ],
        };
      },
    });
  };

  // Keyboard shortcut (Ctrl+Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code]);

  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500">
      {/* Header */}
      <Box p={6} borderBottom="1px solid rgba(255,255,255,0.1)">
        <VStack spacing={4} align="stretch">
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
                Live Coding - Python
              </Heading>
              {roomId && (
                <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                  Room: {roomId.slice(0, 8)}...
                </Badge>
              )}
            </HStack>
            <HStack spacing={2}>
              {roomId ? (
                <>
                  <Tooltip label="Скопировать ссылку">
                    <IconButton
                      icon={<FiCopy />}
                      aria-label="Copy link"
                      size="sm"
                      bg="rgba(255,255,255,0.1)"
                      color="white"
                      _hover={{ bg: "rgba(255,255,255,0.2)" }}
                      onClick={copyRoomLink}
                    />
                  </Tooltip>
                  {isAdmin && (
                    <Tooltip label="Админ может присоединиться">
                      <IconButton
                        icon={<FiExternalLink />}
                        aria-label="Admin join"
                        size="sm"
                        bg="purple.600"
                        color="white"
                        _hover={{ bg: "purple.700" }}
                        onClick={() => {
                          setJoinRoomId(roomId);
                          joinRoom();
                        }}
                      />
                    </Tooltip>
                  )}
                  <Button
                    onClick={leaveRoom}
                    size="sm"
                    bg="red.600"
                    color="white"
                    _hover={{ bg: "red.700" }}
                  >
                    Покинуть комнату
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={createRoom}
                    isLoading={isCreatingRoom}
                    loadingText="Создание..."
                    size="sm"
                    bg="green.600"
                    color="white"
                    _hover={{ bg: "green.700" }}
                    leftIcon={<FiUsers />}
                  >
                    Создать комнату
                  </Button>
                  {isAdmin && (
                    <HStack>
                      <Input
                        placeholder="ID комнаты"
                        value={joinRoomId}
                        onChange={(e) => setJoinRoomId(e.target.value)}
                        size="sm"
                        bg="rgba(255,255,255,0.1)"
                        color="white"
                        borderColor="gray.600"
                        maxW="200px"
                      />
                      <Button
                        onClick={joinRoom}
                        isLoading={isJoiningRoom}
                        loadingText="Вход..."
                        size="sm"
                        bg="purple.600"
                        color="white"
                        _hover={{ bg: "purple.700" }}
                        leftIcon={<FiExternalLink />}
                      >
                        Присоединиться
                      </Button>
                    </HStack>
                  )}
                </>
              )}
            </HStack>
          </HStack>

          {/* Participants */}
          {roomId && participants.size > 0 && (
            <HStack>
              <Text color="gray.400" fontSize="sm">
                Участники:
              </Text>
              <AvatarGroup size="sm" max={5}>
                {Array.from(participants.values()).map((p: any, idx: number) => (
                  <Avatar
                    key={idx}
                    name={p.userName}
                    bg={p.color}
                    src={undefined}
                  />
                ))}
              </AvatarGroup>
              <Badge colorScheme="green">{participants.size} онлайн</Badge>
            </HStack>
          )}
        </VStack>
      </Box>

      <HStack align="flex-start" p={6} spacing={6}>
        {/* Editor */}
        <Box flex={1}>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text color="white" fontWeight="bold">
                Редактор кода:
              </Text>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  bg="rgba(255,255,255,0.1)"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                  onClick={() => loadExample("basic")}
                >
                  Основы
                </Button>
                <Button
                  size="sm"
                  bg="rgba(255,255,255,0.1)"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                  onClick={() => loadExample("functions")}
                >
                  Функции
                </Button>
                <Button
                  size="sm"
                  bg="rgba(255,255,255,0.1)"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                  onClick={() => loadExample("arrays")}
                >
                  Массивы
                </Button>
                <Button
                  size="sm"
                  bg="rgba(255,255,255,0.1)"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                  onClick={() => loadExample("async")}
                >
                  Async
                </Button>
                <Button
                  size="sm"
                  bg="rgba(255,255,255,0.1)"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                  onClick={() => loadExample("oop")}
                >
                  Классы
                </Button>
              </HStack>
            </HStack>

            <Editor
              height="500px"
              theme="vs-dark"
              language="python"
              value={code}
              onChange={handleEditorChange}
              onMount={onMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />

            <HStack spacing={4}>
              <Button
                leftIcon={<Icon as={FiPlay} />}
                bg="green.600"
                color="white"
                _hover={{ bg: "green.700" }}
                onClick={runCode}
                isLoading={isRunning}
                loadingText="Выполнение..."
              >
                Выполнить (Ctrl+Enter)
              </Button>
              <Button
                leftIcon={<Icon as={FiTrash} />}
                bg="red.600"
                color="white"
                _hover={{ bg: "red.700" }}
                onClick={clearCode}
              >
                Очистить
              </Button>
            </HStack>
          </VStack>
        </Box>

        {/* Output */}
        <Box flex={1} maxW="600px">
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text color="white" fontWeight="bold">
                Результат:
              </Text>
              {lastExecutedBy && (
                <Badge colorScheme="blue" fontSize="xs">
                  👤 {lastExecutedBy}
                </Badge>
              )}
            </HStack>

            <Box
              bg="rgba(0,0,0,0.5)"
              borderRadius="lg"
              border="1px solid rgba(255,255,255,0.1)"
              flex={1}
              minH="500px"
              overflow="hidden"
              display="flex"
              flexDirection="column"
            >
              {/* Output tabs */}
              <HStack
                bg="rgba(255,255,255,0.05)"
                px={4}
                py={2}
                borderBottom="1px solid rgba(255,255,255,0.1)"
              >
                <Badge colorScheme="green">STDOUT</Badge>
                {error && <Badge colorScheme="red">STDERR</Badge>}
              </HStack>

              {/* Output content */}
              <Box flex={1} p={4} overflowY="auto" fontFamily="mono" fontSize="sm">
                {output && (
                  <Box mb={4}>
                    <Text color="green.400" fontWeight="bold" mb={2}>
                      # Вывод:
                    </Text>
                    <Box
                      as="pre"
                      color="gray.200"
                      whiteSpace="pre-wrap"
                      fontFamily="monospace"
                    >
                      {output}
                    </Box>
                  </Box>
                )}

                {error && (
                  <Box>
                    <Text color="red.400" fontWeight="bold" mb={2}>
                      # Ошибка:
                    </Text>
                    <Box
                      as="pre"
                      color="red.300"
                      whiteSpace="pre-wrap"
                      fontFamily="monospace"
                    >
                      {error}
                    </Box>
                  </Box>
                )}

                {!output && !error && (
                  <Box color="gray.500" textAlign="center" py={20}>
                    <Text>Нажмите "Выполнить" для запуска кода</Text>
                    <Text fontSize="xs" mt={2}>
                      или выберите пример из меню выше
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
}
