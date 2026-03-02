import { useRef, useState, useEffect } from "react";
import {
  Box,
  HStack,
  Button,
  useToast,
  Text,
  Select,
  VStack,
  Input,
  IconButton,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import { Editor } from "@monaco-editor/react";
import Output from "./Output";
import Timer from "./Timer";
import { Leaderboard } from "./Leaderboard";
import { useProblemTimer } from "../hooks/useProblemTimer";
import type { editor as MonacoEditorNS } from "monaco-editor";
import type { OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { runPython } from "../py/pyodideRunner";
import { PGlite } from "@electric-sql/pglite";
import {
  createRoomWebSocket,
  saveCodeVersion,
} from "../api/client";

// ---------- helpers ----------
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

// File interface
interface EditorFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

// Generate unique file ID
const generateFileId = () => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get default file extension based on language
const getFileExtension = (language: string) => {
  if (language === "postgresql") return "sql";
  return language;
};

// =========================
// PROBLEMS
// =========================
export const PROBLEMS = [
  // --- PYTHON ---
  {
    id: "py-palindrome",
    title: "Palindrome Check (Python)",
    language: "python",
    description:
      "Write a function is_palindrome(text) that returns True if the string reads the same forwards and backwards.",
    starterCode: `def is_palindrome(text):
    # Your code here
    pass`,
    testWrapper: `
print(is_palindrome('aba'))
print(is_palindrome('abc'))
`,
    expectedOutput: "True\nFalse",
  },
  {
    id: "py-factorial",
    title: "Factorial (Python)",
    language: "python",
    description: "Write a recursive function factorial(n).",
    starterCode: `def factorial(n):
    # Your code here
    pass`,
    testWrapper: `
print(factorial(0))
print(factorial(5))
`,
    expectedOutput: "1\n120",
  },
  {
    id: "py-normalize-email",
    title: "Email Normalization (Python)",
    language: "python",
    description:
      "Write a function normalize_email(email) that strips whitespace and converts to lowercase.",
    starterCode: `def normalize_email(email):
    # Your code here
    pass`,
    testWrapper: `
print(normalize_email('  Test@Example.COM '))
print(normalize_email('USER@MAIL.RU'))
`,
    expectedOutput: "test@example.com\nuser@mail.ru",
  },
  {
    id: "py-parse-log-level",
    title: "Log Level Parser (Python)",
    language: "python",
    description:
      "Write a function extract_level(line) that returns the log level (INFO/WARN/ERROR) from a string like '[ERROR] msg'. Return 'UNKNOWN' if no level found.",
    starterCode: `def extract_level(line):
    # Your code here
    pass`,
    testWrapper: `
print(extract_level("[INFO] service started"))
print(extract_level("[ERROR] failed to connect"))
print(extract_level("service started"))
`,
    expectedOutput: "INFO\nERROR\nUNKNOWN",
  },
  {
    id: "py-filter-ints",
    title: "Filter Positive Numbers (Python)",
    language: "python",
    description:
      "Write a function filter_positive(nums) that returns a list of only positive numbers (> 0).",
    starterCode: `def filter_positive(nums):
    # Your code here
    pass`,
    testWrapper: `
print(filter_positive([0, -1, 2, 3, -5, 4]))
print(filter_positive([-10, 0, -2]))
`,
    expectedOutput: "[2, 3, 4]\n[]",
  },
  {
    id: "py-fibonacci",
    title: "Fibonacci Sequence (Python)",
    language: "python",
    description:
      "Write a function fibonacci(n) that returns the nth Fibonacci number (0-indexed).",
    starterCode: `def fibonacci(n):
    # Your code here
    pass`,
    testWrapper: `
print(fibonacci(0))
print(fibonacci(1))
print(fibonacci(10))
`,
    expectedOutput: "0\n1\n55",
  },
  {
    id: "py-count-vowels",
    title: "Count Vowels (Python)",
    language: "python",
    description:
      "Write a function count_vowels(text) that returns the number of vowels (a, e, i, o, u) in the string.",
    starterCode: `def count_vowels(text):
    # Your code here
    pass`,
    testWrapper: `
print(count_vowels('Hello World'))
print(count_vowels('AEIOU'))
print(count_vowels('xyz'))
`,
    expectedOutput: "3\n5\n0",
  },
  {
    id: "py-reverse-string",
    title: "Reverse String (Python)",
    language: "python",
    description:
      "Write a function reverse_string(s) that returns the string reversed.",
    starterCode: `def reverse_string(s):
    # Your code here
    pass`,
    testWrapper: `
print(reverse_string('hello'))
print(reverse_string('Python'))
`,
    expectedOutput: "olleh\nnohtyP",
  },
  {
    id: "py-is-prime",
    title: "Prime Number Check (Python)",
    language: "python",
    description:
      "Write a function is_prime(n) that returns True if n is a prime number.",
    starterCode: `def is_prime(n):
    # Your code here
    pass`,
    testWrapper: `
print(is_prime(2))
print(is_prime(17))
print(is_prime(1))
print(is_prime(20))
`,
    expectedOutput: "True\nTrue\nFalse\nFalse",
  },
  {
    id: "py-flatten-list",
    title: "Flatten Nested List (Python)",
    language: "python",
    description:
      "Write a function flatten(nested_list) that flattens a nested list one level deep.",
    starterCode: `def flatten(nested_list):
    # Your code here
    pass`,
    testWrapper: `
print(flatten([[1, 2], [3, 4], [5]]))
print(flatten([[], [1], [[2]]]))
`,
    expectedOutput: "[1, 2, 3, 4, 5]\n[1, [2]]",
  },
  {
    id: "py-find-max",
    title: "Find Maximum (Python)",
    language: "python",
    description:
      "Write a function find_max(nums) that returns the maximum value in a list.",
    starterCode: `def find_max(nums):
    # Your code here
    pass`,
    testWrapper: `
print(find_max([1, 5, 3, 9, 2]))
print(find_max([-1, -5, -3]))
`,
    expectedOutput: "9\n-1",
  },
  {
    id: "py-remove-duplicates",
    title: "Remove Duplicates (Python)",
    language: "python",
    description:
      "Write a function remove_duplicates(items) that removes duplicate values while preserving order.",
    starterCode: `def remove_duplicates(items):
    # Your code here
    pass`,
    testWrapper: `
print(remove_duplicates([1, 2, 2, 3, 1, 4]))
print(remove_duplicates(['a', 'b', 'a', 'c']))
`,
    expectedOutput: "[1, 2, 3, 4]\n['a', 'b', 'c']",
  },

  // --- SQL via PGlite (PostgreSQL) ---
  {
    id: "sql-select-all",
    title: "All Employees (SQL)",
    language: "postgresql",
    description:
      "Select all columns from the employees table. (Table already created: id, name, salary)",
    starterCode: `-- Write your query below
`,
    testWrapper: `
CREATE TABLE employees (id INTEGER, name TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Alice', 60000);
INSERT INTO employees VALUES (2, 'Bob', 40000);
-- SEPARATOR --
`,
    expectedOutput: "1|Alice|60000\n2|Bob|40000",
  },
  {
    id: "sql-where",
    title: "Salary Above 50k (SQL)",
    language: "postgresql",
    description:
      "Select names (name) of employees with salary greater than 50000.",
    starterCode: `SELECT ...`,
    testWrapper: `
CREATE TABLE employees (id INTEGER, name TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Alice', 60000);
INSERT INTO employees VALUES (2, 'Bob', 40000);
INSERT INTO employees VALUES (3, 'Charlie', 55000);
-- SEPARATOR --
`,
    expectedOutput: "Alice\nCharlie",
  },
  {
    id: "sql-count-rows",
    title: "Count Employees (SQL)",
    language: "postgresql",
    description:
      "Count the number of rows in the employees table. Output a single number.",
    starterCode: `SELECT ...;`,
    testWrapper: `
CREATE TABLE employees (id INTEGER, name TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Alice', 60000);
INSERT INTO employees VALUES (2, 'Bob', 40000);
INSERT INTO employees VALUES (3, 'Charlie', 55000);
-- SEPARATOR --
`,
    expectedOutput: "3",
  },
  {
    id: "sql-order-by-salary",
    title: "Sort by Salary (SQL)",
    language: "postgresql",
    description:
      "Select name and salary from employees, sorted by salary in descending order (DESC).",
    starterCode: `SELECT ...`,
    testWrapper: `
CREATE TABLE employees (id INTEGER, name TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Alice', 60000);
INSERT INTO employees VALUES (2, 'Bob', 40000);
INSERT INTO employees VALUES (3, 'Charlie', 55000);
-- SEPARATOR --
`,
    expectedOutput: "Alice|60000\nCharlie|55000\nBob|40000",
  },
  {
    id: "sql-group-by-dept",
    title: "Group by Department (SQL)",
    language: "postgresql",
    description:
      "There is a table employees (id, name, dept, salary). Select dept and average salary (avg_salary) by department. Sort by dept.",
    starterCode: `SELECT ...`,
    testWrapper: `
CREATE TABLE employees (id INTEGER, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Alice', 'IT', 60000);
INSERT INTO employees VALUES (2, 'Bob', 'HR', 40000);
INSERT INTO employees VALUES (3, 'Charlie', 'IT', 55000);
INSERT INTO employees VALUES (4, 'Diana', 'HR', 45000);
-- SEPARATOR --
`,
    expectedOutput: "HR|42500\nIT|57500",
  },
  {
    id: "sql-join-tables",
    title: "JOIN Departments (SQL)",
    language: "postgresql",
    description:
      "Join employees and departments tables. Select employee name and department name.",
    starterCode: `SELECT ...`,
    testWrapper: `
CREATE TABLE departments (id INTEGER, name TEXT);
INSERT INTO departments VALUES (1, 'Engineering');
INSERT INTO departments VALUES (2, 'Sales');
CREATE TABLE employees (id INTEGER, name TEXT, dept_id INTEGER);
INSERT INTO employees VALUES (1, 'Alice', 1);
INSERT INTO employees VALUES (2, 'Bob', 2);
INSERT INTO employees VALUES (3, 'Charlie', 1);
-- SEPARATOR --
`,
    expectedOutput: "Alice|Engineering\nBob|Sales\nCharlie|Engineering",
  },
  {
    id: "sql-update-salary",
    title: "Update Salary (SQL)",
    language: "postgresql",
    description:
      "Give all employees a 10% raise. Update the salary column and select all rows.",
    starterCode: `UPDATE ...`,
    testWrapper: `
CREATE TABLE employees (id INTEGER, name TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Alice', 60000);
INSERT INTO employees VALUES (2, 'Bob', 40000);
-- SEPARATOR --
`,
    expectedOutput: "1|Alice|66000\n2|Bob|44000",
  },
  {
    id: "sql-delete-records",
    title: "Delete Records (SQL)",
    language: "postgresql",
    description:
      "Delete all employees with salary less than 50000. Then select all remaining rows.",
    starterCode: `DELETE ...`,
    testWrapper: `
CREATE TABLE employees (id INTEGER, name TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Alice', 60000);
INSERT INTO employees VALUES (2, 'Bob', 40000);
INSERT INTO employees VALUES (3, 'Charlie', 55000);
-- SEPARATOR --
`,
    expectedOutput: "1|Alice|60000\n3|Charlie|55000",
  },
  {
    id: "sql-having-clause",
    title: "HAVING Clause (SQL)",
    language: "postgresql",
    description:
      "Select departments with more than 1 employee. Use GROUP BY and HAVING.",
    starterCode: `SELECT ...`,
    testWrapper: `
CREATE TABLE employees (id INTEGER, name TEXT, dept TEXT);
INSERT INTO employees VALUES (1, 'Alice', 'IT');
INSERT INTO employees VALUES (2, 'Bob', 'HR');
INSERT INTO employees VALUES (3, 'Charlie', 'IT');
INSERT INTO employees VALUES (4, 'Diana', 'IT');
-- SEPARATOR --
`,
    expectedOutput: "IT|3",
  },
  {
    id: "sql-subquery",
    title: "Subquery (SQL)",
    language: "postgresql",
    description:
      "Select employees whose salary is above the average salary. Use a subquery.",
    starterCode: `SELECT ...`,
    testWrapper: `
CREATE TABLE employees (id INTEGER, name TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Alice', 60000);
INSERT INTO employees VALUES (2, 'Bob', 40000);
INSERT INTO employees VALUES (3, 'Charlie', 55000);
-- SEPARATOR --
`,
    expectedOutput: "Alice",
  },
];

// ---------- local runners (no server) ----------

// ВАЖНО: создаём новый инстанс на каждую проверку SQL,
// чтобы база была "чистой" и тесты не ломались из-за старых таблиц.
async function runPostgresInBrowser(sourceCode: string) {
  const pg = new PGlite();

  try {
    const result = await pg.exec(sourceCode);

    // Собираем вывод в максимально простом виде:
    // - если запрос SELECT возвращает строки: печатаем строки через |
    // - иначе ничего не печатаем
    let out = "";

    for (const res of result) {
      if (res.rows && res.rows.length > 0) {
        const columns = res.fields.map((f) => f.name);
        for (const row of res.rows as any[]) {
          out += columns.map((c) => String(row[c])).join("|") + "\n";
        }
      }
    }

    return { stdout: out.trim(), stderr: "" };
  } catch (e: any) {
    return { stdout: "", stderr: e?.message ?? String(e) };
  }
}

async function executeCodeLocal(language: string, sourceCode: string) {
  if (language === "python") {
    const { stdout, stderr } = await runPython(sourceCode);
    return { run: { stdout: (stdout ?? "").trim(), stderr: stderr || "" } };
  }

  if (language === "postgresql") {
    const { stdout, stderr } = await runPostgresInBrowser(sourceCode);
    return { run: { stdout: (stdout ?? "").trim(), stderr: stderr || "" } };
  }

  return { run: { stdout: "", stderr: `Unsupported language: ${language}` } };
}

// =========================
// COMPONENT
// =========================
const CodeEditor = ({
  roomId,
  userName,
  roomLanguage,
}: {
  roomId: string;
  userName: string;
  roomLanguage?: string;
}) => {
  const ydocRef = useRef<Y.Doc | null>(null);
  const yProviderRef = useRef<WebsocketProvider | null>(null);
  const yBindingRef = useRef<MonacoBinding | null>(null);
  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [language, _setLanguage] = useState(roomLanguage || "python");
  const [currentProblemId, setCurrentProblemId] = useState<string>("");

  // Multiple files state
  const [files, setFiles] = useState<EditorFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>("");
  const [newFileName, setNewFileName] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Remote cursors state
  const [remoteCursors, setRemoteCursors] = useState<Map<string, any>>(new Map());

  const decorationIds = useRef<string[]>([]);
  const toast = useToast();

  const [isChecking, setIsChecking] = useState(false);

  // Per-problem timer hook
  const { elapsedTime, recordSolve } = useProblemTimer({
    roomId,
    userName,
    problemId: currentProblemId,
  });

  // Handle WebSocket messages
  const handleWebSocketMessage = (msg: any) => {
    switch (msg.type) {
      case "cursor.update":
        if (msg.user_name !== userName) {
          setRemoteCursors((prev) => {
            const next = new Map(prev);
            next.set(msg.user_name, msg);
            return next;
          });
        }
        break;
      case "room.joined":
        console.log("User joined room");
        break;
      case "room.left":
        console.log("User left room");
        break;
      case "leaderboard.updated":
        // Leaderboard was updated, refresh will happen via polling in Leaderboard component
        break;
      default:
        break;
    }
  };

  // Filter problems by room language
  const filteredProblems = PROBLEMS.filter(
    (p) => !roomLanguage || p.language === roomLanguage
  );

  // Initialize with default file
  useEffect(() => {
    if (roomLanguage && files.length === 0) {
      const ext = getFileExtension(roomLanguage);
      const defaultFile: EditorFile = {
        id: generateFileId(),
        name: `main.${ext}`,
        content: "",
        language: roomLanguage,
      };
      setFiles([defaultFile]);
      setActiveFileId(defaultFile.id);
    }
  }, [roomLanguage]);

  // Get active file
  const activeFile = files.find((f) => f.id === activeFileId);

  // Update active file content
  const updateActiveFileContent = (content: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, content } : f))
    );
  };

  // Add new file
  const handleAddFile = () => {
    if (!newFileName.trim()) return;

    const ext = getFileExtension(language);
    const fileName = newFileName.trim().endsWith(`.${ext}`)
      ? newFileName.trim()
      : `${newFileName.trim()}.${ext}`;

    const newFile: EditorFile = {
      id: generateFileId(),
      name: fileName,
      content: "",
      language,
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setNewFileName("");
    onClose();
  };

  // Remove file
  const handleRemoveFile = (fileId: string) => {
    if (files.length <= 1) {
      toast({
        title: "Cannot remove last file",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const newFiles = files.filter((f) => f.id !== fileId);
    setFiles(newFiles);

    if (activeFileId === fileId) {
      setActiveFileId(newFiles[0].id);
    }
  };

  const handleProblemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const probId = e.target.value;
    const problem = PROBLEMS.find((p) => p.id === probId);

    if (problem) {
      setCurrentProblemId(probId);
      // Set starter code in active file
      updateActiveFileContent(problem.starterCode);
      const m = monacoRef.current;
      const model = editorRef.current?.getModel();
      if (m && model) {
        m.editor.setModelLanguage(
          model,
          problem.language === "postgresql" ? "sql" : problem.language
        );
      }
    } else {
      setCurrentProblemId("");
    }
  };

  const checkSolution = async () => {
    const problem = PROBLEMS.find((p) => p.id === currentProblemId);
    if (!problem) {
      toast({ title: "Выберите задачу", status: "warning" });
      return;
    }

    setIsChecking(true);

    // --- подготовка кода ---
    const codeFromEditor = activeFile?.content ?? "";
    let codeToRun = codeFromEditor;

    if (problem.language === "python") {
      codeToRun = codeFromEditor + "\n" + (problem.testWrapper ?? "");
    } else if (problem.language === "postgresql") {
      const parts = (problem.testWrapper ?? "").split("-- SEPARATOR --");
      const setup = parts[0] ?? "";
      codeToRun = setup + "\n" + codeFromEditor;
    }

    try {
      const result = await executeCodeLocal(problem.language, codeToRun);

      if (result.run.stderr) {
        toast({
          title: "Ошибка выполнения",
          description: result.run.stderr,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        return;
      }

      const output = (result.run.stdout ?? "").trim();
      const expected = (problem.expectedOutput ?? "").trim();
      
      // Normalize output comparison - handle trailing/leading whitespace and line endings
      const normalizeOutput = (str: string) => str.replace(/\r\n/g, "\n").trim();
      const normalizedOutput = normalizeOutput(output);
      const normalizedExpected = normalizeOutput(expected);
      
      const isCorrect = normalizedOutput === normalizedExpected;
      
      if (isCorrect) {
        // Record solve time to leaderboard via API
        await recordSolve(problem.title, problem.language);
        
        // Also send via WebSocket for real-time update
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: "leaderboard.submit",
            user_name: userName,
            problem_id: currentProblemId,
            problem_title: problem.title,
            time_seconds: elapsedTime,
            language: problem.language,
          }));
        }
      }
      if (isCorrect) {
        toast({
          title: "Верно!",
          description: `Все тесты пройдены успешно! Время: ${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, "0")}`,
          status: "success",
          duration: 3000,
        });
      } else {
        toast({
          title: "Тесты не пройдены",
          description: `Ожидалось:\n${normalizedExpected}\n\nПолучено:\n${normalizedOutput}`,
          status: "error",
          duration: 6000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error?.message ?? "Не удалось выполнить код",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setIsChecking(false);
    }
  };

  const onMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;
    editor.focus();

    // Initialize Yjs for collaborative editing
    const ydoc = new Y.Doc();
    const YWS_URL = `ws://${window.location.hostname}:8000/yjs`;
    const provider = new WebsocketProvider(YWS_URL, roomId, ydoc);

    const ytext = ydoc.getText("monaco");
    const model = editor.getModel();
    if (model) {
      const binding = new MonacoBinding(
        ytext,
        model,
        new Set([editor]),
        provider.awareness
      );
      ydocRef.current = ydoc;
      yProviderRef.current = provider;
      yBindingRef.current = binding;
    }

    // Initialize room WebSocket for real-time messages
    const ws = createRoomWebSocket(roomId);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to room:", roomId);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      handleWebSocketMessage(msg);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("Disconnected from room");
    };

    // курсор
    editor.onDidChangeCursorPosition((e) => {
      const position = e.position;
      if (!roomId || !userName || !wsRef.current) return;

      wsRef.current.send(JSON.stringify({
        type: "cursor.update",
        user_name: userName,
        line_number: position.lineNumber,
        column: position.column,
        color: stringToColor(userName),
      }));
    });

    // python подсказки
    monacoInstance.languages.registerCompletionItemProvider("python", {
      provideCompletionItems: (model: any, position: any) => {
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
                monacoInstance.languages.CompletionItemInsertTextRule
                  .InsertAsSnippet,
              range,
            },
            {
              label: "def",
              kind: monacoInstance.languages.CompletionItemKind.Keyword,
              insertText:
                "def ${1:func_name}(${2:args}):\n\t${3:pass}",
              insertTextRules:
                monacoInstance.languages.CompletionItemInsertTextRule
                  .InsertAsSnippet,
              range,
            },
          ],
        };
      },
    });

    // sql подсказки (для monaco "sql" режима)
    monacoInstance.languages.registerCompletionItemProvider("sql", {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const sqlKeywords = [
          "SELECT",
          "FROM",
          "WHERE",
          "INSERT INTO",
          "VALUES",
          "UPDATE",
          "SET",
          "DELETE",
          "CREATE TABLE",
          "DROP TABLE",
          "GROUP BY",
          "ORDER BY",
          "LIMIT",
          "COUNT(*)",
          "AVG(",
        ];

        return {
          suggestions: sqlKeywords.map((key) => ({
            label: key,
            kind: monacoInstance.languages.CompletionItemKind.Keyword,
            insertText: key,
            range,
          })),
        };
      },
    });
  };

  // --- курсоры других пользователей ---
  useEffect(() => {
    if (!roomId) return;

    const m = monacoRef.current;
    const ed = editorRef.current;
    if (!ed || !m) return;

    const newDecorations: any[] = [];
    const cssRules: string[] = [];

    remoteCursors.forEach((data) => {
      if (data.user_name === userName) return;

      const safeUserName = String(data.user_name).replace(/[^a-zA-Z0-9]/g, "");
      const cursorClass = `remote-cursor-${safeUserName}`;

      cssRules.push(`
        .${cursorClass} { position: absolute; border-left: 2px solid ${data.color}; height: 20px !important; display: block; z-index: 100; pointer-events: none; }
        .${cursorClass}::after { content: "${data.user_name}"; position: absolute; top: -18px; left: 0; background: ${data.color}; color: #fff; font-size: 10px; padding: 2px 4px; border-radius: 3px; white-space: nowrap; }
      `);

      newDecorations.push({
        range: new m.Range(
          data.line_number,
          data.column,
          data.line_number,
          data.column
        ),
        options: {
          className: cursorClass,
          stickiness:
            m.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          isWholeLine: false,
        },
      });
    });

    let styleElement = document.getElementById(`cursors-styles-${roomId}`);
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = `cursors-styles-${roomId}`;
      document.head.appendChild(styleElement);
    }
    styleElement.innerHTML = cssRules.join("\n");

    decorationIds.current = ed.deltaDecorations(
      decorationIds.current,
      newDecorations
    );
  }, [roomId, userName, remoteCursors, files]);

  // --- синхронизация кода ---
  useEffect(() => {
    return () => {
      // Cleanup WebSocket
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      // Cleanup Yjs
      try {
        yBindingRef.current?.destroy();
      } catch {}
      try {
        yProviderRef.current?.destroy();
      } catch {}
      try {
        ydocRef.current?.destroy();
      } catch {}
      yBindingRef.current = null;
      yProviderRef.current = null;
      ydocRef.current = null;
    };
  }, [roomId]);

  // Cursor cleanup is handled automatically by WebSocket disconnect

  async function saveCode() {
    const code = activeFile?.content ?? "";
    if (!code.trim()) return;

    try {
      await saveCodeVersion(roomId, {
        file_name: activeFile?.name,
        code,
        language,
        saved_by: userName,
      });
      toast({ title: "Code saved.", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      toast({ title: "Error saving code.", status: "error", duration: 3000, isClosable: true });
    }
  }

  // Handle editor content change
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateActiveFileContent(value);
    }
  };

  return (
    <Box>
      <Grid templateColumns="2fr 1fr" gap={6}>
        <GridItem>
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
                  "> option": {
                    background: "#2D3748",
                    color: "white",
                  },
                }}
              >
                {filteredProblems.map((prob) => (
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
                isLoading={isChecking}
                loadingText="Проверка..."
              >
                Проверить решение
              </Button>
            </HStack>

            {currentProblemId && (
              <Box
                p={3}
                bg="gray.700"
                borderRadius="md"
                borderLeft="4px solid teal"
              >
                <HStack justify="space-between">
                  <Text color="gray.200" fontSize="md">
                    {PROBLEMS.find((p) => p.id === currentProblemId)?.description}
                  </Text>
                  {currentProblemId && (
                    <Box bg="teal.600" px={3} py={1} borderRadius="md">
                      <Text color="white" fontSize="sm" fontFamily="mono">
                        ⏱ {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, "0")}
                      </Text>
                    </Box>
                  )}
                </HStack>
              </Box>
            )}
          </VStack>

          <HStack spacing={4} align="flex-start">
            <Box w="100%">
              <HStack justify="space-between" mb={4} alignItems="center">
                <HStack spacing={6}>
                  <Box ml={2}>
                    <Text color="gray.400" fontSize="sm">
                      Language:
                    </Text>
                    <Text color="white" fontSize="xl" fontWeight="bold">
                      {language.toUpperCase()}
                    </Text>
                  </Box>
                  <Timer />
                </HStack>

                <HStack spacing={2}>
                  <Button
                    leftIcon={<AddIcon />}
                    size="sm"
                    onClick={onOpen}
                    sx={{
                      color: "#ffffff",
                      bg: "rgba(255,255,255, 0.1)",
                      _hover: { bg: "rgba(255,255,255, 0.2)" },
                    }}
                  >
                    New File
                  </Button>
                  <Button
                    sx={{
                      color: "#ffffff",
                      fontSize: "1rem",
                      borderRadius: "6px",
                      _hover: { bg: "rgba(248,248,255, 0.3)" },
                    }}
                    onClick={saveCode}
                  >
                    Save Code
                  </Button>
                </HStack>
              </HStack>

          {/* File tabs */}
          <HStack spacing={2} mb={2} flexWrap="wrap">
            {files.map((file) => (
              <Flex
                key={file.id}
                align="center"
                px={3}
                py={1}
                borderRadius="md"
                bg={activeFileId === file.id ? "teal.600" : "gray.700"}
                color="white"
                cursor="pointer"
                onClick={() => setActiveFileId(file.id)}
                _hover={{ bg: activeFileId === file.id ? "teal.500" : "gray.600" }}
              >
                <Text fontSize="sm" mr={2}>
                  {file.name}
                </Text>
                {files.length > 1 && (
                  <IconButton
                    aria-label="Remove file"
                    icon={<CloseIcon w={2} h={2} />}
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(file.id);
                    }}
                    ml={1}
                  />
                )}
              </Flex>
            ))}
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
              padding: { top: 15, bottom: 15 },
            }}
            height="70vh"
            theme="vs-dark"
            language={language === "postgresql" ? "sql" : language}
            value={activeFile?.content || ""}
            onChange={handleEditorChange}
            onMount={onMount}
          />
        </Box>

        <Output
          roomId={roomId}
        />
      </HStack>
        </GridItem>

        {/* Leaderboard Sidebar */}
        <GridItem>
          <Leaderboard roomId={roomId} currentProblemId={currentProblemId || undefined} />
        </GridItem>
      </Grid>

      {/* New File Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader color="white">Create New File</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Input
              placeholder={`filename.${getFileExtension(language)}`}
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              bg="gray.700"
              color="white"
              borderColor="gray.600"
              _placeholder={{ color: "gray.400" }}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} color="white">
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleAddFile}
              isDisabled={!newFileName.trim()}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CodeEditor;
