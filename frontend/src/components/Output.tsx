import { useState } from "react";
import { Box, Button, Text, useToast, Spinner } from "@chakra-ui/react";
import { executeCode } from "../api";
import { useEffect } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../main";

const Output = ({
  roomId,
  userName,
  editorRef,
  language,
}: {
  roomId: string;
  userName: string;
  editorRef: any;
  language: string;
}) => {
  const [output, setOutput] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const toast = useToast();
  const [syncedRun, setSyncedRun] = useState<any>(null);

  useEffect(() => {
  if (!roomId) return;

  const roomRef = doc(firestore, "rooms", roomId);
  const unsub = onSnapshot(roomRef, (snap) => {
    const data: any = snap.data();
    if (data?.lastRun) setSyncedRun(data.lastRun);
  });

  return () => unsub();
}, [roomId]);

  const runCode = async () => {
    const sourceCode = editorRef.current?.getValue?.() ?? "";
    if (!sourceCode.trim()) return;

    try {
      setIsLoading(true);
      setOutput([]);
      setIsError(false);

      const result = await executeCode(language, sourceCode);

      const outText = (result?.run?.output ?? "").toString();
      await setDoc(
        doc(firestore, "rooms", roomId),
        {
          lastRun: {
            by: userName,
            language,
            output: outText ?? "",
            stderr: result?.run?.stderr ? String(result.run.stderr) : "",
            ok: !result?.run?.stderr,
            updatedAt: serverTimestamp(),
          },
        },
        { merge: true }
      );
      const outputLines = outText ? outText.split("\n") : [];

      if (result?.run?.stderr) {
        setIsError(true);
        const errorLines = String(result.run.stderr).split("\n");
        setOutput([...outputLines, ...errorLines].filter(Boolean));
      } else {
        setIsError(false);
        setOutput(outputLines);
      }
    } catch (error: any) {
      setIsError(true);
      setOutput([error?.message || "Unknown error occurred"]);

      toast({
        title: "Execution failed",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box w="50%">
      <Text mb={2} fontSize="lg" color="white">
        Output
      </Text>

      <Button
        variant="outline"
        colorScheme="green"
        mb={4}
        isLoading={isLoading}
        onClick={runCode}
        _hover={{ bg: "rgba(72, 187, 120, 0.1)" }}
      >
        Run Code
      </Button>

      <Box
        height="75vh"
        p={3}
        border="1px solid"
        borderRadius={4}
        borderColor={isError ? "red.500" : "#333"}
        bg="#1e1e1e"
        overflowY="auto"
      >
        {isLoading ? (
          <Spinner color="blue.500" />
        ) : syncedRun ? (
          // 🔥 синхронизированный вывод из Firestore
          String(syncedRun.stderr || syncedRun.output)
            .split("\n")
            .filter(Boolean)
            .map((line: string, i: number) => (
              <Text
                key={i}
                color={syncedRun.stderr ? "red.400" : "white"}
                fontFamily="monospace"
                whiteSpace="pre-wrap"
              >
                {line}
              </Text>
            ))
        ) : output ? (
          // локальный вывод (fallback)
          output.map((line, i) => (
            <Text
              key={i}
              color={isError ? "red.400" : "white"}
              fontFamily="monospace"
              whiteSpace="pre-wrap"
            >
              {line}
            </Text>
          ))
        ) : (
          <Text color="gray.500">Click "Run Code" to see the output here</Text>
        )}
      </Box>
    </Box>
  );
};

export default Output;
