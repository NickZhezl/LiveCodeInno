import { useRef, useState, useEffect } from "react";
import { Box, HStack, Button, useToast, Text } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { LANGUAGE_VERSIONS, CODE_SNIPPETS } from "../constants"; // Импортируем SNIPPETS
import Output from "./Output";
import * as monaco from "monaco-editor";
import { firestore } from "../main";
import { doc, setDoc, onSnapshot, collection, serverTimestamp } from "firebase/firestore";

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

let savedCodeCode = 0;

const CodeEditor = ({ roomId, userName }: { roomId: string; userName: string }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [value, setValue] = useState<string>("// Loading...");
  const [language, setLanguage] = useState("javascript");
  const decorationIds = useRef<string[]>([]);
  const toast = useToast();

  const onMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: typeof monaco
  ) => {
    editorRef.current = editor;
    editor.focus();

    // 1. Отправка курсора
    editor.onDidChangeCursorPosition((e) => {
      if (!roomId || !userName) return;
      const position = e.position;
      const cursorRef = doc(firestore, `rooms/${roomId}/cursors/${userName}`);
      setDoc(cursorRef, {
        userName: userName,
        color: stringToColor(userName),
        lineNumber: position.lineNumber,
        column: position.column,
        updatedAt: serverTimestamp()
      }, { merge: true }).catch(console.error);
    });

    // 2. Подсказки для PYTHON
    monacoInstance.languages.registerCompletionItemProvider("python", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
        };
        return { suggestions: [
            { label: "print", kind: monacoInstance.languages.CompletionItemKind.Function, insertText: "print(${1:value})", insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
            { label: "def", kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: "def ${1:func_name}(${2:args}):\n\t${3:pass}", insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet, range }
        ]};
      },
    });

    // 3. Подсказки для SQL / POSTGRESQL (НОВОЕ)
    monacoInstance.languages.registerCompletionItemProvider("sql", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
        };
        
        // Список популярных команд SQL
        const sqlKeywords = [
          "SELECT", "FROM", "WHERE", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE",
          "CREATE TABLE", "DROP TABLE", "ALTER TABLE", "PRIMARY KEY", "FOREIGN KEY",
          "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "ORDER BY", "GROUP BY",
          "LIMIT", "OFFSET", "AND", "OR", "NOT", "NULL", "TRUE", "FALSE",
          "SERIAL", "INT", "TEXT", "VARCHAR", "BOOLEAN", "DATE", "TIMESTAMP"
        ];

        const suggestions = sqlKeywords.map(key => ({
            label: key,
            kind: monacoInstance.languages.CompletionItemKind.Keyword,
            insertText: key,
            range: range
        }));

        return { suggestions: suggestions };
      },
    });
  };

  // --- СИНХРОНИЗАЦИЯ КУРСОРОВ ---
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

    return () => {
        unsubscribe();
        const styleElement = document.getElementById(`cursors-styles-${roomId}`);
        if(styleElement) styleElement.remove();
    };
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
          // Если код пустой или новый язык, подгружаем сниппет
          if (!data.code) {
             setValue(CODE_SNIPPETS[data.language] || "");
          }
        }
        if (data.code !== undefined && data.code !== value) {
             if (editorRef.current && editorRef.current.getValue() !== data.code) {
               setValue(data.code);
             }
        }
      } else {
        // Если комната новая, ставим дефолт
        setValue(CODE_SNIPPETS["javascript"]);
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue === undefined) return;
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
      <HStack spacing={4} align="flex-start">
        <Box w="50%">
          <HStack justify="space-between" mb={4} alignItems="center">
            <Box ml={2}>
                <Text color="gray.400" fontSize="sm">Language:</Text>
                <Text color="white" fontSize="xl" fontWeight="bold">
                    {language.toUpperCase()} 
                    <Text as="span" fontSize="sm" color="gray.500" ml={2}>
                        ({LANGUAGE_VERSIONS[language] || ""})
                    </Text>
                </Text>
            </Box>
            <Button
              sx={{
                color: "#ffffff",
                marginRight: "1.5rem",
                fontSize: "1rem",
                borderRadius: "6px",
                transition: "background-color 0.2s ease-in-out",
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
              padding: { top: 15, bottom: 15 }
            }}
            height="70vh"
            theme="vs-dark"
            // ВАЖНО: Если язык postgresql, говорим редактору, что это sql
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