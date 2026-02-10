import { useRef, useState, useEffect } from "react";
import { Box, HStack, Button, useToast, Text } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";
import Timer from "./Timer"; // Импорт таймера
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

const CodeEditor = ({ roomId, userName }: { roomId: string; userName: string }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [value, setValue] = useState<string>("// Loading...");
  const [language, setLanguage] = useState("javascript");
  
  // Refs
  const decorationIds = useRef<string[]>([]);
  const localDecorationIds = useRef<string[]>([]);
  
  // Флаг, чтобы не отправлять обратно в базу то, что только что пришло из базы
  const isRemoteUpdate = useRef(false);

  const toast = useToast();

  const onMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: typeof monaco
  ) => {
    editorRef.current = editor;
    editor.focus();

    // === 1. ГЕНЕРАЦИЯ СТИЛЯ ДЛЯ СЕБЯ ===
    const myColor = stringToColor(userName);
    const mySafeName = userName.replace(/[^a-zA-Z0-9]/g, '');
    const myCursorClass = `my-local-cursor-${mySafeName}`;
    
    const styleId = `my-cursor-style-${userName}`;
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = `
            .${myCursorClass} { background: transparent; border: none; width: 0 !important; }
            .${myCursorClass}::after {
                content: "${userName}";
                position: absolute; top: -18px; left: 0;
                background: ${myColor}; color: #fff;
                font-size: 10px; font-weight: bold;
                padding: 2px 4px; border-radius: 3px;
                white-space: nowrap; opacity: 0.7; pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    // === 2. ОБРАБОТКА ДВИЖЕНИЯ ===
    editor.onDidChangeCursorPosition((e) => {
      const position = e.position;
      
      // Рисуем свой бейджик
      const newDecoration: monaco.editor.IModelDeltaDecoration = {
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        options: { className: myCursorClass, stickiness: monacoInstance.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges }
      };
      localDecorationIds.current = editor.deltaDecorations(localDecorationIds.current, [newDecoration]);

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

    // === 3. НАСТРОЙКИ ЯЗЫКОВ ===
    monacoInstance.languages.registerCompletionItemProvider("python", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
        return { suggestions: [
            { label: "print", kind: monacoInstance.languages.CompletionItemKind.Function, insertText: "print(${1:value})", insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet, range },
            { label: "def", kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: "def ${1:func_name}(${2:args}):\n\t${3:pass}", insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet, range }
        ]};
      },
    });

    monacoInstance.languages.registerCompletionItemProvider("sql", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
        const sqlKeywords = ["SELECT", "FROM", "WHERE", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE TABLE", "DROP TABLE", "SERIAL", "INT", "TEXT"];
        return { suggestions: sqlKeywords.map(key => ({ label: key, kind: monacoInstance.languages.CompletionItemKind.Keyword, insertText: key, range: range }))};
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

  // --- 🔥 ИСПРАВЛЕННАЯ СИНХРОНИЗАЦИЯ КОДА (БЕЗ МЕРЦАНИЯ) ---
  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(firestore, "rooms", roomId);
    
    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // 1. Обновляем язык, если изменился
        if (data.language && data.language !== language) {
          setLanguage(data.language);
          if (!data.code) setValue(CODE_SNIPPETS[data.language] || "");
        }

        // 2. УМНОЕ ОБНОВЛЕНИЕ КОДА
        if (data.code !== undefined) {
             // Получаем текущий текст в редакторе
             const currentEditorValue = editorRef.current ? editorRef.current.getValue() : "";
             
             // Если текст в базе отличается от того, что у нас на экране
             if (currentEditorValue !== data.code) {
               
               // Ставим флаг, что это изменение пришло извне (чтобы не отправлять его обратно)
               isRemoteUpdate.current = true;
               
               if (editorRef.current) {
                   // Сохраняем позицию курсора, чтобы он не прыгал в начало
                   const currentPos = editorRef.current.getPosition();
                   
                   // Меняем значение напрямую в модели (без перерисовки React!)
                   editorRef.current.setValue(data.code);
                   
                   // Возвращаем курсор на место
                   if (currentPos) {
                       editorRef.current.setPosition(currentPos);
                   }
               }
               
               // Обновляем React-стейт для синхронности, но редактор уже обновлен
               setValue(data.code);
               
               // Снимаем флаг через короткое время
               setTimeout(() => { isRemoteUpdate.current = false; }, 100);
             }
        }
      } else {
        setValue(CODE_SNIPPETS["javascript"]);
      }
    });
    return () => unsubscribe();
  }, [roomId]); // Убрали 'language' и 'value' из зависимостей

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue === undefined) return;
    
    // Если это обновление пришло из базы, мы его не отправляем обратно (защита от петли)
    if (isRemoteUpdate.current) return;

    setValue(newValue);
    const roomRef = doc(firestore, "rooms", roomId);
    // Debounce можно добавить здесь, если будет тормозить, но пока пишем напрямую
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