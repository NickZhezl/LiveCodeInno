import { useRef, useState, useEffect } from "react";
import { Box, HStack, Button, useToast, Text, Select, VStack } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";
import Timer from "./Timer";
import * as monaco from "monaco-editor";
import { firestore } from "../main";
import { doc, setDoc, onSnapshot, collection, serverTimestamp } from "firebase/firestore";

import { runPython } from "../py/pyodideRunner";
import { PGlite } from "@electric-sql/pglite";

// ---------- helpers ----------
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

let savedCodeCode = 0;

// =========================
// PROBLEMS
// =========================
export const PROBLEMS = [
  // --- PYTHON ---
  {
    id: "py-palindrome",
    title: "Проверка палиндрома (Python)",
    language: "python",
    description:
      "Напишите функцию is_palindrome(text), которая возвращает True, если строка читается одинаково в обе стороны.",
    starterCode: `def is_palindrome(text):
    # Ваш код здесь
    pass`,
    testWrapper: `
print(is_palindrome('aba'))
print(is_palindrome('abc'))
`,
    expectedOutput: "TrueFalse",
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
    expectedOutput: "1\n120",
  },
  {
    id: "py-normalize-email",
    title: "Нормализация email (Python)",
    language: "python",
    description:
      "Напишите функцию normalize_email(email), которая убирает пробелы по краям и приводит строку к нижнему регистру.",
    starterCode: `def normalize_email(email):
    # Ваш код здесь
    pass`,
    testWrapper: `
print(normalize_email('  Test@Example.COM '))
print(normalize_email('USER@MAIL.RU'))
`,
    expectedOutput: "test@example.com\nuser@mail.ru",
  },
  {
    id: "py-parse-log-level",
    title: "Уровень логов (Python)",
    language: "python",
    description:
      "Напишите функцию extract_level(line), которая возвращает уровень лога (INFO/WARN/ERROR) из строки вида '[ERROR] msg'. Если уровня нет — верните 'UNKNOWN'.",
    starterCode: `def extract_level(line):
    # Ваш код здесь
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
    title: "Фильтрация чисел (Python)",
    language: "python",
    description:
      "Напишите функцию filter_positive(nums), которая возвращает список только положительных чисел (> 0).",
    starterCode: `def filter_positive(nums):
    # Ваш код здесь
    pass`,
    testWrapper: `
print(filter_positive([0, -1, 2, 3, -5, 4]))
print(filter_positive([-10, 0, -2]))
`,
    expectedOutput: "[2, 3, 4]\n[]",
  },

  // --- SQL via PGlite (PostgreSQL) ---
  {
    id: "sql-select-all",
    title: "Все сотрудники (SQL)",
    language: "postgresql",
    description:
      "Выберите все столбцы из таблицы employees. (Таблица уже создана: id, name, salary)",
    starterCode: `-- Напишите запрос ниже
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
    title: "Зарплата выше 50k (SQL)",
    language: "postgresql",
    description: "Выберите имена (name) сотрудников, у которых зарплата больше 50000.",
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
    title: "Количество сотрудников (SQL)",
    language: "postgresql",
    description: "Посчитайте количество строк в таблице employees. Выведите одно число.",
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
    title: "Сортировка по зарплате (SQL)",
    language: "postgresql",
    description:
      "Выведите name и salary из employees, отсортировав по salary по убыванию (DESC).",
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
    title: "Группировка по отделам (SQL)",
    language: "postgresql",
    description:
      "Есть таблица employees (id, name, dept, salary). Выведите dept и среднюю зарплату (avg_salary) по отделам. Отсортируйте по dept.",
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
const CodeEditor = ({ roomId, userName }: { roomId: string; userName: string }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const [value, setValue] = useState<string>("// Loading...");
  const [language, setLanguage] = useState("python");
  const [currentProblemId, setCurrentProblemId] = useState<string>("");

  const decorationIds = useRef<string[]>([]);
  const isRemoteUpdate = useRef(false);
  const toast = useToast();

  const [isChecking, setIsChecking] = useState(false);

  const handleProblemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const probId = e.target.value;
    const problem = PROBLEMS.find((p) => p.id === probId);

    if (problem) {
      setCurrentProblemId(probId);
      setValue(problem.starterCode);
      setLanguage(problem.language);

      const roomRef = doc(firestore, "rooms", roomId);
      setDoc(
        roomRef,
        {
          code: problem.starterCode,
          language: problem.language,
        },
        { merge: true }
      );
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
    let codeToRun = value;

    if (problem.language === "python") {
      codeToRun = value + "\n" + (problem.testWrapper ?? "");
    } else if (problem.language === "postgresql") {
      // SQL: сначала setup, затем код пользователя
      const parts = (problem.testWrapper ?? "").split("-- SEPARATOR --");
      const setup = parts[0] ?? "";
      codeToRun = setup + "\n" + value;
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

      if (output === expected) {
        toast({
          title: "Верно!",
          description: "Все тесты пройдены успешно.",
          status: "success",
          duration: 3000,
        });
      } else {
        toast({
          title: "Тесты не пройдены",
          description: `Ожидалось:\n${expected}\n\nПолучено:\n${output}`,
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

  const onMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => {
    editorRef.current = editor;
    editor.focus();

    // курсор
    editor.onDidChangeCursorPosition((e) => {
      const position = e.position;
      if (!roomId || !userName) return;

      const cursorRef = doc(firestore, `rooms/${roomId}/cursors/${userName}`);
      setDoc(
        cursorRef,
        {
          userName,
          color: stringToColor(userName),
          lineNumber: position.lineNumber,
          column: position.column,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ).catch(console.error);
    });

    // python подсказки
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
              insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: "def",
              kind: monacoInstance.languages.CompletionItemKind.Keyword,
              insertText: "def ${1:func_name}(${2:args}):\n\t${3:pass}",
              insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
          ],
        };
      },
    });

    // sql подсказки (для monaco "sql" режима)
    monacoInstance.languages.registerCompletionItemProvider("sql", {
      provideCompletionItems: (model, position) => {
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

    const cursorsCollection = collection(firestore, `rooms/${roomId}/cursors`);
    const unsubscribe = onSnapshot(cursorsCollection, (snapshot) => {
      if (!editorRef.current || !monaco) return;

      const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];
      const cssRules: string[] = [];

      snapshot.forEach((d) => {
        const data: any = d.data();
        if (data.userName === userName) return;

        const safeUserName = String(data.userName).replace(/[^a-zA-Z0-9]/g, "");
        const cursorClass = `remote-cursor-${safeUserName}`;

        cssRules.push(`
          .${cursorClass} { position: absolute; border-left: 2px solid ${data.color}; height: 20px !important; display: block; z-index: 100; pointer-events: none; }
          .${cursorClass}::after { content: "${data.userName}"; position: absolute; top: -18px; left: 0; background: ${data.color}; color: #fff; font-size: 10px; padding: 2px 4px; border-radius: 3px; white-space: nowrap; }
        `);

        newDecorations.push({
          range: new monaco.Range(data.lineNumber, data.column, data.lineNumber, data.column),
          options: {
            className: cursorClass,
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
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

      decorationIds.current = editorRef.current.deltaDecorations(decorationIds.current, newDecorations);
    });

    return () => unsubscribe();
  }, [roomId, userName]);

  // --- синхронизация кода ---
  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(firestore, "rooms", roomId);

    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data: any = docSnap.data();

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
            setTimeout(() => {
              isRemoteUpdate.current = false;
            }, 100);
          }
        }
      } else {
        setValue(CODE_SNIPPETS["python"] || "");
        setLanguage("python");
      }
    });

    return () => unsubscribe();
  }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const docData = { code: value, language, timestamp: new Date() };

    try {
      await setDoc(docReference, docData);
      toast({ title: "Code saved.", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      toast({ title: "Error saving code.", status: "error", duration: 3000, isClosable: true });
    }
  }

  return (
    <Box>
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
            {PROBLEMS.map((prob) => (
              <option key={prob.id} value={prob.id} style={{ backgroundColor: "#2D3748", color: "white" }}>
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
          <Box p={3} bg="gray.700" borderRadius="md" borderLeft="4px solid teal">
            <Text color="gray.200" fontSize="md">
              {PROBLEMS.find((p) => p.id === currentProblemId)?.description}
            </Text>
          </Box>
        )}
      </VStack>

      <HStack spacing={4} align="flex-start">
        <Box w="50%">
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
              <Timer roomId={roomId} />
            </HStack>

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
