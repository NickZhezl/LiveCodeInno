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

interface LiveCodingProps {
  onBack: () => void;
  initialRoomId?: string;
}

// JavaScript code interpreter using Function constructor (sandboxed)
const executeJavaScript = async (code: string): Promise<{
  stdout: string;
  stderr: string;
  success: boolean;
}> => {
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let success = true;

    try {
      // Create a custom console to capture output
      const customConsole = {
        log: (...args: any[]) => {
          stdout += args
            .map((arg) =>
              typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
            )
            .join(" ") + "\n";
        },
        error: (...args: any[]) => {
          stderr += args
            .map((arg) =>
              typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
            )
            .join(" ") + "\n";
        },
        warn: (...args: any[]) => {
          stdout += "[WARN] " + args.join(" ") + "\n";
        },
        info: (...args: any[]) => {
          stdout += "[INFO] " + args.join(" ") + "\n";
        },
      };

      // Create a safe execution context
      const runCode = new Function(
        "console",
        `
        "use strict";
        try {
          ${code}
        } catch (e) {
          throw e;
        }
      `
      );

      runCode(customConsole);
    } catch (error: any) {
      stderr = error.message || "Unknown error";
      success = false;
    }

    resolve({
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      success,
    });
  });
};

export default function LiveCoding({ onBack, initialRoomId }: LiveCodingProps) {
  const { userData, isAdmin } = useAuth();
  const [code, setCode] = useState<string>(`// Live Coding - JavaScript Песочница
// Пишите любой код здесь и нажимайте "Выполнить"

// Пример 1: Переменные и типы данных
const name = "JavaScript Developer";
const age = 25;
const skills = ["JavaScript", "TypeScript", "React"];

console.log(\`Привет, \${name}!\`);
console.log(\`Возраст: \${age}\`);
console.log(\`Навыки: \${skills.join(", ")}\`);

// Пример 2: Функции
function greet(person) {
  return \`Hello, \${person}!\`;
}

console.log(greet("World"));

// Пример 3: Массивы и методы
const numbers = [1, 2, 3, 4, 5];
const squares = numbers.map(x => x ** 2);
console.log(\`Квадраты: \${squares}\`);

// Пример 4: Асинхронность
async function fetchData() {
  console.log("Загрузка данных...");
  return { data: "success" };
}

fetchData().then(result => console.log(result));
`);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [roomId, setRoomId] = useState<string>(initialRoomId || "");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [participants, setParticipants] = useState<Map<string, any>>(new Map());
  
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const toast = useToast();
  const decorationIds = useRef<string[]>([]);

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
      const result = await executeJavaScript(code);

      if (result.stderr) {
        setError(result.stderr);
        toast({ title: "Ошибка выполнения", status: "error", duration: 5000 });
      } else {
        setOutput(result.stdout || "Код выполнен успешно (нет вывода)");
        toast({ title: "Код выполнен!", status: "success" });
      }
    } catch (e: any) {
      setError(e.message || "Неизвестная ошибка");
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
        language: "javascript",
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
    const link = `${window.location.origin}/?room=${roomId}`;
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
      basic: `// Основы JavaScript
// Переменные и типы данных

// let, const, var
let age = 25;
const name = "Alice";
var oldStyle = "deprecated";

// Типы данных
const string = "Hello";
const number = 42;
const boolean = true;
const nullValue = null;
const undefinedValue = undefined;
const array = [1, 2, 3];
const object = { key: "value" };

console.log("=== Типы данных ===");
console.log(\`String: \${typeof string} = \${string}\`);
console.log(\`Number: \${typeof number} = \${number}\`);
console.log(\`Boolean: \${typeof boolean} = \${boolean}\`);
console.log(\`Array: \${Array.isArray(array) ? "array" : "not array"} = \${array}\`);
console.log(\`Object: \${typeof object} = \${JSON.stringify(object)}\`);
`,
      functions: `// Функции JavaScript

// Function Declaration
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Function Expression
const greetExpr = function(name) {
  return \`Hi, \${name}!\`;
};

// Arrow Function
const greetArrow = (name) => \`Hey, \${name}!\`;

// Arrow Function с телом
const greetMulti = (name) => {
  const greeting = \`Welcome, \${name}!\`;
  return greeting;
};

// Параметры по умолчанию
function greetDefault(name = "Guest") {
  return \`Hello, \${name}!\`;
}

// Rest параметры
function sumAll(...numbers) {
  return numbers.reduce((sum, n) => sum + n, 0);
}

console.log(greet("Alice"));
console.log(greetExpr("Bob"));
console.log(greetArrow("Charlie"));
console.log(greetMulti("David"));
console.log(greetDefault());
console.log(\`Sum: \${sumAll(1, 2, 3, 4, 5)}\`);
`,
      arrays: `// Массивы и методы

const numbers = [1, 2, 3, 4, 5];
const fruits = ["apple", "banana", "cherry"];

console.log("=== Базовые операции ===");
console.log(\`Длина: \${numbers.length}\`);
console.log(\`Первый: \${numbers[0]}\`);
console.log(\`Последний: \${numbers[numbers.length - 1]}\`);

console.log("\\n=== Методы массивов ===");
console.log(\`map: \${numbers.map(x => x * 2)}\`);
console.log(\`filter: \${numbers.filter(x => x > 2)}\`);
console.log(\`reduce: \${numbers.reduce((sum, n) => sum + n, 0)}\`);
console.log(\`find: \${numbers.find(x => x > 3)}\`);
console.log(\`some: \${numbers.some(x => x > 4)}\`);
console.log(\`every: \${numbers.every(x => x > 0)}\`);

console.log("\\n=== Цепочки методов ===");
const result = numbers
  .filter(x => x % 2 === 1)
  .map(x => x ** 2)
  .reduce((sum, n) => sum + n, 0);
console.log(\`Сумма квадратов нечетных: \${result}\`);
`,
      async: `// Асинхронность

// Promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("Promise resolved!");
  }, 1000);
});

// Async/Await
async function fetchData() {
  console.log("Начало загрузки...");
  
  const data = await new Promise(resolve => {
    setTimeout(() => {
      resolve({ id: 1, name: "Data" });
    }, 500);
  });
  
  console.log("Данные получены:", data);
  return data;
}

// Multiple promises
async function fetchMultiple() {
  const [data1, data2] = await Promise.all([
    Promise.resolve("Data 1"),
    Promise.resolve("Data 2")
  ]);
  
  console.log("Multiple:", data1, data2);
}

console.log("Запуск асинхронных операций...");
fetchData();
fetchMultiple();

promise.then(result => console.log(result));
`,
      oop: `// Классы и ООП

class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    return \`Hello, I'm \${this.name}\`;
  }

  static species() {
    return "Homo Sapiens";
  }
}

class Student extends Person {
  constructor(name, age, grade) {
    super(name, age);
    this.grade = grade;
  }

  study() {
    return \`\${this.name} изучает JavaScript\`;
  }

  // Переопределение метода
  greet() {
    return \`\${super.greet()}, a student\`;
  }
}

const alice = new Person("Alice", 25);
const bob = new Student("Bob", 20, "A");

console.log(alice.greet());
console.log(bob.greet());
console.log(bob.study());
console.log(\`Species: \${Person.species()}\`);
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
            editorRef.current.setValue(data.code);
            setCode(data.code);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [roomId]);

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

    // JavaScript autocompletion
    monacoInstance.languages.registerCompletionItemProvider("javascript", {
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
              label: "console.log",
              kind: monacoInstance.languages.CompletionItemKind.Function,
              insertText: "console.log(${1:value})",
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: "function",
              kind: monacoInstance.languages.CompletionItemKind.Keyword,
              insertText: "function ${1:name}(${2:args}) {\\n\\t${3:}\\n}",
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: "const",
              kind: monacoInstance.languages.CompletionItemKind.Keyword,
              insertText: "const ${1:name} = ${2:value};",
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: "async/await",
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText:
                "async function ${1:name}() {\\n\\ttry {\\n\\t\\t${2:await promise}\\n\\t} catch (error) {\\n\\t\\t${3:console.error(error)}\\n\\t}\\n}",
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
                Live Coding - JavaScript
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
              language="javascript"
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
            <Text color="white" fontWeight="bold">
              Результат:
            </Text>

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
