import { useRef, useState, useEffect } from "react";
import { Box, HStack, Button, useToast, Text, Select, VStack } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";
import Timer from "./Timer";
import * as monaco from "monaco-editor";
import { firestore } from "../main";
import { doc, setDoc, onSnapshot, collection, serverTimestamp } from "firebase/firestore";

// Функция генерации цвета
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

let savedCodeCode = 0;

export const PROBLEMS = [
  // --- PYTHON ---
  {
    id: "py-palindrome",
    title: "Проверка палиндрома (Python)",
    language: "python",
    description: "Напишите функцию is_palindrome(text), которая возвращает True, если строка читается одинаково в обе стороны.",
    starterCode: `def is_palindrome(text):
    # Ваш код здесь
    pass`,
    // Мы добавляем этот код к коду пользователя перед отправкой
    testWrapper: `
print(is_palindrome('aba'))
print(is_palindrome('abc'))
`,
    // Мы ожидаем, что в консоль выведется именно это
    expectedOutput: "True\nFalse"
  },
  {
    id: "py-factorial",
    title: "Факториал (Python)",
    language: "python",
    description: "Напишите рекурсивную функцию factorial(n).",
    starterCode: `def factorial(n):
    # Ваш код здесь
    pass`,
    testWrapper: `
print(factorial(0))
print(factorial(5))
`,
    expectedOutput: "1\n120"
  },

  // --- SQL (SQLite через Piston работает как SQL песочница) ---
  {
    id: "sql-select-all",
    title: "Все сотрудники (SQL)",
    language: "sqlite3", // Piston использует sqlite3, синтаксис почти как у Postgres
    description: "Выберите все столбцы из таблицы employees. (Таблица уже создана: id, name, salary)",
    starterCode: `-- Напишите запрос ниже
`,
    // Для SQL мы сначала создаем таблицу, потом вставляем данные, потом идет код юзера
    testWrapper: `
CREATE TABLE employees (id INTEGER, name TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Alice', 60000);
INSERT INTO employees VALUES (2, 'Bob', 40000);
-- SEPARATOR --
`,
    // Ожидаем вывод в формате pipe-separated (как выдает sqlite)
    expectedOutput: "1|Alice|60000\n2|Bob|40000"
  },
  {
    id: "sql-where",
    title: "Зарплата выше 50k (SQL)",
    language: "sqlite3",
    description: "Выберите имена (name) сотрудников, у которых зарплата больше 50000.",
    starterCode: `SELECT ...`,
    testWrapper: `
CREATE TABLE employees (id INTEGER, name TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Alice', 60000);
INSERT INTO employees VALUES (2, 'Bob', 40000);
INSERT INTO employees VALUES (3, 'Charlie', 55000);
-- SEPARATOR --
`,
    expectedOutput: "Alice\nCharlie"
  }
];

const executeCode = async (language: string, sourceCode: string) => {
  const response = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: language === "sql" ? "sqlite3" : language, // Маппинг для Piston
      version: "*",
      files: [{ content: sourceCode }],
    }),
  });
  const data = await response.json();
  return data; // Возвращает объект { run: { stdout: "...", stderr: "..." } }
};

const CodeEditor = ({ roomId, userName }: { roomId: string; userName: string }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [value, setValue] = useState<string>("// Loading...");
  // Изменили дефолтный язык на python
  const [language, setLanguage] = useState("python"); 
  const [currentProblemId, setCurrentProblemId] = useState<string>("");

  // Refs
  const decorationIds = useRef<string[]>([]);
  const isRemoteUpdate = useRef(false);
  const toast = useToast();

  const handleProblemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const probId = e.target.value;
    const problem = PROBLEMS.find(p => p.id === probId);
    
    if (problem) {
      setCurrentProblemId(probId);
      setValue(problem.starterCode);
      setLanguage(problem.language);
      
      const roomRef = doc(firestore, "rooms", roomId);
      setDoc(roomRef, { 
        code: problem.starterCode,
        language: problem.language
      }, { merge: true });
    } else {
        setCurrentProblemId("");
    }
  };

  const [isChecking, setIsChecking] = useState(false);

  const checkSolution = async () => {
    const problem = PROBLEMS.find(p => p.id === currentProblemId);
    if (!problem) {
        toast({ title: "Выберите задачу", status: "warning" });
        return;
    }

    setIsChecking(true);
    let codeToRun = value;

    // --- ПОДГОТОВКА КОДА ---
    if (problem.language === "python") {
        // В Python добавляем тесты В КОНЕЦ
        codeToRun = value + "\n" + problem.testWrapper;
    } else if (problem.language === "sqlite3" || problem.language === "sql") {
        // В SQL: Сначала создание таблиц + код юзера
        // Piston выполняет файл целиком, поэтому просто склеиваем
        // Но нам нужно вставить код юзера ПОСЛЕ создания таблиц
        const parts = problem.testWrapper?.split("-- SEPARATOR --");
        const setup = parts ? parts[0] : "";
        codeToRun = setup + "\n" + value;
    }

    try {
        // --- ОТПРАВКА НА СЕРВЕР ---
        const result = await executeCode(problem.language, codeToRun);
        
        // Если есть ошибка компиляции/выполнения (stderr)
        if (result.run.stderr) {
            toast({ 
                title: "Ошибка выполнения", 
                description: result.run.stderr, 
                status: "error", 
                duration: 9000, 
                isClosable: true 
            });
            setIsChecking(false);
            return;
        }

        // --- СРАВНЕНИЕ РЕЗУЛЬТАТА ---
        const output = result.run.stdout.trim(); // То, что вернул сервер
        const expected = problem.expectedOutput?.trim(); // То, что мы ждем

        if (output === expected) {
            toast({ 
                title: "Верно!", 
                description: "Все тесты пройдены успешно.", 
                status: "success", 
                duration: 3000 
            });
        } else {
            toast({ 
                title: "Тесты не пройдены", 
                description: `Ожидалось:\n${expected}\n\nПолучено:\n${output}`, 
                status: "error", 
                duration: 5000,
                isClosable: true
            });
        }

    } catch (error) {
        toast({ title: "Ошибка сети", status: "error" });
    } finally {
        setIsChecking(false);
    }
  };

  const onMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: typeof monaco
  ) => {
    editorRef.current = editor;
    editor.focus();

    // === 1. ОБРАБОТКА ДВИЖЕНИЯ ===
    editor.onDidChangeCursorPosition((e) => {
        const position = e.position;
        if (!roomId || !userName) return;
        const cursorRef = doc(firestore, `rooms/${roomId}/cursors/${userName}`);
        setDoc(cursorRef, {
            userName: userName,
            color: stringToColor(userName),
            lineNumber: position.lineNumber,
            column: position.column,
            updatedAt: serverTimestamp()
        }, { merge: true }).catch(console.error);
    });

    // === 2. НАСТРОЙКИ ЯЗЫКОВ (PYTHON) ===
    monacoInstance.languages.registerCompletionItemProvider("python", {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
            return {
                suggestions: [
                    { label: "print", kind: monacoInstance.languages.CompletionItemKind.Function, insertText: "print(${1:value})", insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
                    { label: "def", kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: "def ${1:func_name}(${2:args}):\n\t${3:pass}", insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet, range }
                ]
            };
        },
    });

    // === 3. НАСТРОЙКИ ЯЗЫКОВ (SQL) ===
    monacoInstance.languages.registerCompletionItemProvider("sql", {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
            const sqlKeywords = ["SELECT", "FROM", "WHERE", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE TABLE", "DROP TABLE", "SERIAL", "INT", "TEXT"];
            return { suggestions: sqlKeywords.map(key => ({ label: key, kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: key, range: range })) };
        },
    });
  };

  // --- СИНХРОНИЗАЦИЯ ЧУЖИХ КУРСОРОВ ---
  useEffect(() => {
    if (!roomId) return;
    const cursorsCollection = collection(firestore, `rooms/${roomId}/cursors`);
    const unsubscribe = onSnapshot(cursorsCollection, (snapshot) => {
      if (!editorRef.current || !monaco) return;
      const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];
      const cssRules: string[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userName === userName) return;

        const safeUserName = data.userName.replace(/[^a-zA-Z0-9]/g, '');
        const cursorClass = `remote-cursor-${safeUserName}`;

        cssRules.push(`
          .${cursorClass} { position: absolute; border-left: 2px solid ${data.color}; height: 20px !important; display: block; z-index: 100; pointer-events: none; }
          .${cursorClass}::after { content: "${data.userName}"; position: absolute; top: -18px; left: 0; background: ${data.color}; color: #fff; font-size: 10px; padding: 2px 4px; border-radius: 3px; white-space: nowrap; }
        `);

        newDecorations.push({
          range: new monaco.Range(data.lineNumber, data.column, data.lineNumber, data.column),
          options: { className: cursorClass, stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges, isWholeLine: false },
        });
      });

      let styleElement = document.getElementById(`cursors-styles-${roomId}`);
      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = `cursors-styles-${roomId}`;
        document.head.appendChild(styleElement);
      }
      styleElement.innerHTML = cssRules.join("\n");
      
      decorationIds.current = editorRef.current.deltaDecorations(decorationIds.current, newDecorations);
    });
    return () => { unsubscribe(); };
  }, [roomId, userName]);

  // --- СИНХРОНИЗАЦИЯ КОДА ---
  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(firestore, "rooms", roomId);
    
    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        if (data.language && data.language !== language) {
          setLanguage(data.language);
          if (!data.code) setValue(CODE_SNIPPETS[data.language] || "");
        }

        if (data.code !== undefined) {
             const currentEditorValue = editorRef.current ? editorRef.current.getValue() : "";
             if (currentEditorValue !== data.code) {
               isRemoteUpdate.current = true;
               if (editorRef.current) {
                   const currentPos = editorRef.current.getPosition();
                   editorRef.current.setValue(data.code);
                   if (currentPos) editorRef.current.setPosition(currentPos);
               }
               setValue(data.code);
               setTimeout(() => { isRemoteUpdate.current = false; }, 100);
             }
        }
      } else {
        // Если комнаты нет, ставим Python по умолчанию
        setValue(CODE_SNIPPETS["python"] || "");
        setLanguage("python");
      }
    });
    return () => unsubscribe();
  }, [roomId]); 

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue === undefined) return;
    if (isRemoteUpdate.current) return;

    setValue(newValue);
    const roomRef = doc(firestore, "rooms", roomId);
    setDoc(roomRef, { code: newValue }, { merge: true });
  };

  async function saveCode() {
    if (!value) return;
    const docReference = doc(firestore, `codes/${roomId}/versions/${savedCodeCode++}`);
    const docData = { code: value, language: language, timestamp: new Date() };
    try {
      await setDoc(docReference, docData);
      toast({ title: "Code saved.", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      toast({ title: "Error saving code.", status: "error", duration: 3000, isClosable: true });
    }
  }

  return (
    <Box>
      {/* === БЛОК ВЫБОРА ЗАДАЧИ === */}
      <VStack align="stretch" mb={6} spacing={3}>
        <HStack justify="space-between">
            <Select 
                placeholder="Выберите задачу из списка..." 
                bg="gray.800" 
                color="white" 
                borderColor="gray.600"
                onChange={handleProblemSelect}
                value={currentProblemId}
                maxW="70%"
                sx={{
                   '> option': {
                     background: '#2D3748', // Темный фон для опций
                     color: 'white',        // Белый текст
                   },
                }}
            >
                {PROBLEMS.map(prob => (
                    <option 
                        key={prob.id} 
                        value={prob.id}
                        style={{ backgroundColor: "#2D3748", color: "white" }} 
                    >
                        {prob.title}
                    </option>
                ))}
            </Select>
            
            <Button 
                colorScheme="green" 
                onClick={checkSolution}
                isDisabled={!currentProblemId}
                isLoading={isChecking} // <-- Добавлено
                loadingText="Проверка..." // <-- Добавлено
            >
                Проверить решение
            </Button>
        </HStack>
        
        {/* Описание задачи */}
        {currentProblemId && (
            <Box p={3} bg="gray.700" borderRadius="md" borderLeft="4px solid teal">
                <Text color="gray.200" fontSize="md">
                    {PROBLEMS.find(p => p.id === currentProblemId)?.description}
                </Text>
            </Box>
        )}
      </VStack>

      {/* === РЕДАКТОР И ХЕДЕР === */}
      <HStack spacing={4} align="flex-start">
        <Box w="50%">
          <HStack justify="space-between" mb={4} alignItems="center">
            <HStack spacing={6}>
                <Box ml={2}>
                    <Text color="gray.400" fontSize="sm">Language:</Text>
                    <Text color="white" fontSize="xl" fontWeight="bold">
                        {language.toUpperCase()} 
                    </Text>
                </Box>
                <Timer roomId={roomId} />
            </HStack>
            <Button
              sx={{ color: "#ffffff", fontSize: "1rem", borderRadius: "6px", _hover: { bg: "rgba(248,248,255, 0.3)" }}}
              onClick={saveCode}
            >
              Save Code
            </Button>
          </HStack>
          
          <Editor
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              cursorStyle: "line",
              cursorWidth: 3,
              renderLineHighlight: "all",
              fontLigatures: true,
              padding: { top: 15, bottom: 15 }
            }}
            height="70vh"
            theme="vs-dark"
            language={language === "postgresql" ? "sql" : language}
            defaultValue="// Loading..." 
            onMount={onMount}
            value={value}
            onChange={handleEditorChange}
          />
        </Box>
        <Output editorRef={editorRef} language={language} />
      </HStack>
    </Box>
  );
};

export default CodeEditor;